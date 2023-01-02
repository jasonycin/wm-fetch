import { Attributes } from "../enums/attributes";
import {Status} from "../enums/status";
import {Levels} from "../enums/levels";
import {Subjects} from "../enums/subjects";
import {TermParts} from "../enums/term_part";

class FilterError extends Error {
    constructor(message: string) {
        super(`W&M Scrapper Error: ${message}`);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class Filter {
    public term?: number;

    public attribute = Attributes.ALL;

    public secondaryAttribute = Attributes.ALL;

    public levels = Levels.ALL;

    public status = Status.ALL;

    public subject = Subjects.ALL;

    public termPart = TermParts.ALL;

    /**
     * Initialize a new Filter
     * @param filters
     * @example
     * const filter = new Filter({
     *    subject: Subjects.BIOLOGY,
     *    status: Status.OPEN,
     *    term: 202320,
     * })
     */
    constructor(filters?: Partial<Filter>) {
        if (filters) Object.assign(this, filters);
        return this;
    }


    public data() {
        if (this.attribute === Attributes.ALL && this.subject === Subjects.ALL) {
            throw new FilterError('You must select a Subject or Attribute');
        }

        return {
            term: { id: 'term_code', value: this.term.toString() },
            subject: { id: 'term_subj', value: this.subject },
            attribute: { id: 'attr', value: this.attribute },
            secondaryAttribute: { id: 'attr2', value: this.secondaryAttribute },
            levels: { id: 'levl', value: this.levels },
            status: { id: 'status', value: this.status },
            termPart: { id: 'ptrm', value: this.termPart },
        }
    }

    /**
     * Returns a URL object with the filter parameters
     * @example
     * const filter = new Filter({
     *   subject: Subjects.BIOLOGY,
     *   status: Status.OPEN,
     *   term: 202320,
     * })
     *
     * console.log(filter.url().href)
     * // https://courselist.wm.edu/courselist/courseinfo/searchresults?term_code=202320&term_subj=BIOL&attr=0&attr2=0&levl=0&status=OPEN&ptrm=0&search=Search
     */
    public url() {
        const data = this.data();
        const url = new URL('https://courselist.wm.edu/courselist/courseinfo/searchresults');
        for (const key in data) {
            url.searchParams.append(data[key].id, data[key].value);
        }
        url.searchParams.append('search', 'Search');
        return url;
    }
}