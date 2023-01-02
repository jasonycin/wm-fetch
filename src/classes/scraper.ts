import { ScraperError } from "../errors/ScraperError";
import {Filter} from "./filter";
import {Subjects} from "../enums/subjects";
import {Attributes} from "../enums/attributes";
import {Course} from "./course";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


export class Scraper {
    private _userAgent: string;

    private _rateLimit = 500; // In milliseconds

    private _lastRequest = 0; // Last fetch request in milliseconds since epoch

    private URL = new URL('https://courselist.wm.edu/courselist/');


    /**
     * Initialize a new Scraper
     * @param userAgent - User agent must be a valid W&M email address
     * @param rateLimit? - Rate limit in milliseconds
     */
    constructor(userAgent: string, rateLimit?: number) {
        this.userAgent = userAgent;
        if (rateLimit) this._rateLimit = rateLimit;
        return this;
    }

    /**
     * Sets the user agent.
     * @param userAgent - Valid W&M email address (regex: `^[a-zA-Z0-9_.+-]+@wm.edu$`)
     */
    public set userAgent(userAgent: string) {
        if (typeof userAgent !== 'string') throw new TypeError('User agent must be a string');

        const regex = RegExp('^[a-zA-Z0-9_.+-]+@wm.edu$')
        if (!regex.test(userAgent)) throw new ScraperError('User agent must be a valid W&M email address');
        this._userAgent = userAgent;
    }

    public get userAgent() {
        return this._userAgent;
    }

    /**
     * Sets the rate limit in milliseconds.
     * @param rateLimit - Must be an integer greater than 0
     * @example Scraper.rateLimit = 5000 // 5 seconds
     */
    public set rateLimit(rateLimit: number) {
        if (typeof rateLimit !== 'number') throw new TypeError('Rate limit must be a number');
        if (rateLimit < 1) throw new RangeError('Rate limit must be at least 1');
        this._rateLimit = rateLimit;
    }

    public get rateLimit() {
        return this._rateLimit;
    }

    /** Extracts all available terms from the Open Course List under the 'term_code' dropdown. */
    public async terms(): Promise<Array<number>> {
        const dom = await this.fetchAndParse(fetch(this.URL.href, {
            method: 'GET',
            headers: {
                'User-Agent': this.userAgent,
                'Accept': 'application/json, text/plain, */*',
            },
        }));

        const terms: HTMLCollection = dom.window.document.getElementById('term_code').children;
        return Array.from(terms).map((term: HTMLOptionElement) => Number(term.value));
    }

    /**
     * Fetches courses from the Open Course List based on the specified filter.
     * @param filters - If no filters are specified, all courses will be returned.
     */
    public async courses(filters?: Filter): Promise<Array<Readonly<Course>>> {
        if (!filters) return await this.all({ term: await this.latestTerm() });

        if (!filters.term) filters.term = await this.latestTerm();
        const url = filters.url();
        const dom = await this.fetchAndParse(fetch(url.href, {
            method: 'GET',
            headers: {
                'User-Agent': this.userAgent,
                'Accept': 'application/json, text/plain, */*',
            }
        }));

        return this.extractCourses(dom);
    }

    /**
     * Fetches all courses from the Open Course List.
     * @param term - Term code to fetch courses from (default: top term in the Open Course List dropdown)
     * @param concurrency - Number of concurrent requests to make in batches
     * @example Scraper.all({ term: 202320, concurrency: 10 }) // 74 subjects/10 batches = 7 requests => 7 requests * 500ms rate limit = 3.5 seconds
     */
    public async all(term?: Pick<Filter, 'term'>, concurrency = 5): Promise<Array<Readonly<Course>>> {
        if (!term) term = { term: await this.latestTerm() };

        const courses: Array<Course> = Array();
        const subjects = Object.values(Subjects).slice(1);

        const batches = Array.from({ length: Math.ceil(subjects.length / concurrency) }, (_, i) => subjects.slice(i * concurrency, i * concurrency + concurrency));
        for (const batch of batches) {
            const filters = batch.map(subject => new Filter({ subject, ...term }));
            const res = await Promise.all(filters.map(filter => this.courses(filter)));
            courses.push(...res.flat());
        }

        return courses;
    }

    private extractCourses(dom: typeof JSDOM): Readonly<Course>[] {
        const info = Array();
        const table = dom.window.document.querySelector('tbody').children;

        for (const row of table) {
            const data = row.getElementsByTagName('td');

            for (const cell of data) {
                info.push(cell.textContent);
            }
        }

        const courses = Array();
        for (let i = 0; i < info.length; i += 11) {
            courses.push(info.slice(i, i + 11));
        }

        return courses.map((course: Array<string>) => {
            return Object.freeze(new Course().fromTable(course));
        });

    }

    private async latestTerm() {
        const terms = await this.terms();
        return Math.max(...terms);
    }

    private async fetchAndParse(req: Promise<Response>) {
        await this.wait();
        try {
            const res = await req;
            if (!res.ok) await Promise.reject(new ScraperError(`Request failed with status code ${res.status}`));

            return this.parseHTML(await res.text());
        } catch (e) {
            throw new ScraperError('Request failed ' + e);
        }
    }

    private async wait() {
        const now = Date.now();
        const diff = now - this._lastRequest;
        if (diff < this._rateLimit) {
            const wait = this._rateLimit - diff;
            await new Promise(resolve => setTimeout(resolve, wait));
            this._lastRequest = Date.now();
        } else {
            this._lastRequest = now;
        }
    }

    private parseHTML(html: string) {
        try {
            return new JSDOM(html);
        } catch (e) {
            throw new ScraperError('Failed to parse HTML ' + e);
        }
    }
}