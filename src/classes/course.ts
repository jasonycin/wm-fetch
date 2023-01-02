import {ScraperError} from "../errors/ScraperError";
import {Status} from "../enums/status";

export class Course {
    public crn: number;
    public id: string;
    public attributes: Array<string> = [];
    public title: string;
    public instructor: string;
    public credits: number;
    public times: string;
    public enrollment: {
        projected: number;
        current: number;
        available: number;
    };
    public status: string;

    /** Returns true/false if seats are available */
    isOpen(): boolean {
        return this.status === Status.OPEN;
    }

    /**
     * @hidden
     * @param data
     */
    fromTable(data: Array<string>): Course {
        try {
            this.crn = parseInt(data[0].replace(/(\r\n|\n|\r)/gm, "").trim());
            this.id = data[1].replace(/(\r\n|\n|\r)/gm, "").trim();
            this.attributes = data[2].replace(/(\r\n|\n|\r)/gm, "").trim().split(',');
            this.title = data[3].replace(/(\r\n|\n|\r)/gm, "").trim();
            this.instructor = data[4].replace(/(\r\n|\n|\r)/gm, "").trim();
            this.credits = parseFloat(data[5].replace(/(\r\n|\n|\r)/gm, "").trim());
            this.times = data[6].replace(/(\r\n|\n|\r)/gm, "").trim();
            this.enrollment = {
                projected: parseInt(data[7].replace(/(\r\n|\n|\r)/gm, "").trim()),
                current: parseInt(data[8].replace(/(\r\n|\n|\r)/gm, "").trim()),
                available: parseInt(data[9].replace(/(\r\n|\n|\r)/gm, "").trim()),
            };
            this.status = data[10].replace(/(\r\n|\n|\r)/gm, "").trim();
            return this;
        } catch (e) {
            throw new ScraperError("Error parsing course data: "+e);
        }
    }
}