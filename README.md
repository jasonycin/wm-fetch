> ⚠️ **Replaces** the deprecated [wm-classes](https://www.npmjs.com/package/wm-classes) library
# W&M Course Scraper

### Information
This is a high-level scrapper for the course list of the College of William and Mary. It can be used to quickly retrieve all courses
found [here](https://courselist.wm.edu/courselist/courseinfo/search?). Feel free to send a pull request with enhancements!

In addition, this scrapper **requires setting a user agent with a W&M email address** and sets a **default rate limit of 500 milliseconds**.
This identifies your requests to the W&M servers and prevents mistakenly overloading the server with requests.

### Table of Contents
1. 📰 [What's changed?](#whats-changed)
2. 🧑‍🏫 [Usage](#usage)
   1. 👷‍♂️[Installation](#installation)
   2. 🏗️ [Instantiation](#instantiation)
   3. 🖥️ [Fetch data](#fetch-course-data)
      1. 🏖️ [All courses](#all-courses--all-)
      2. ⛱️ [Specific query](#specific-query--courses-)
   4. 🤓 [Enums & filters](#enums--filter)
   5. 📕 [Course class](#course-class)
   6. 🫶 [Additional methods](#additional-methods)
3. 👏 [Author](#author)

## What's changed?
> ⚠️ **Replaces** the deprecated [wm-classes](https://www.npmjs.com/package/wm-classes) library.  
> I've made major changes that make this library much more reliable and less opinionated. You may notice that
> CSV and JSON support has been removed. It's now up to you to decide how you want to save your data!
- **v3.0.0** - 🎉 Replaces the deprecated [wm-classes](https://www.npmjs.com/package/wm-classes) library

## Usage
### Installation
In the terminal, run the following command:
```bash
npm install wm-fetch
```
After installation of the NPM module, you can import the library:
```ts
// For TypeScript use the import syntax (reccomended):
import { Scraper, Filter } from 'wm-fetch';

// For JavaScript use the require syntax:
const wm = require('wm-classes');
```

### Instantiation (`new Scraper()`)
`userAgent` - Required. Must be a valid @wm.edu email address.  

`rateLimit` - Optional. The rate limit in milliseconds. Defaults to 500ms.
> ⚠️ **Note:** Please be honest and conscious with the user-agent and the rate limit. The W&M servers are not meant to be overloaded with requests. If there are issues, the user-agent allows them to contact you.
```ts
// TODO: Replace user agent string
const scraper = new Scraper('abcdef@wm.edu')
```

### Fetch Course Data
You can either get all data or filter your query. If you do not provide a filter, all courses will be retrieved.
#### All courses (`.all()`)
`term` - Optional. If not provided, the latest term will be fetched.  
`concurrency` - Optional. If set, requests will be made concurrently in batches.
> ⚠️🚨 **Be careful with concurrency.** If you set it too high, you may overload the W&M servers and get blocked. You will exceed your set rate limit!  
>   
> 🧐 **Example**: With unique 74 subjects and a default rate limit of 500ms and a concurrency of 10, you will make 
7 requests in parallel and wait 500ms between each batch. This will take about 3.5 seconds to complete.
```ts
const scraper = new Scraper('abcdef@wm.edu');
const courses = await scraper.all({ term: 202320, concurrency: 5 });
```

#### Specific Query (`.courses()`)
`filters` - Optional. See [Filter](#filter). 
```ts
const scraper = new Scraper('abcdef@wm.edu');
const filter = new Filter({ subject: Subjects.BIOLOGY })
const courses = await scraper.courses(filter)
```

### Enums & Filter
Use this to specify your query. This is the biggest breaking-change from the previously deprecated `wm-classes` library.
For IntelliSense support, the enums `Attributes`, `Levels`, `Status`, `Subjects`, and `TermPart` are provided.
These are also the available arguments.
  
> 🚨 **Hint**: Not setting a `Subject` AND `Attribute` will throw a `ScraperError`.
#### Examples

```ts
import { Filter, Attributes, Levels, Status, Subjects, TermPart } from "wm-fetch";

// Biology courses with the NQR attribute
new Filter({
    subject: Subjects.BIOLOGY,
    attribute: Attributes.NAT_WORLD_QUANT_REASONING
})

// Open undergraduate computer science courses
new Filter({
    subject: Subjects.COMPUTER_SCIENCE,
    level: Levels.UNDERGRADUATE,
    status: Status.OPEN
})
```

#### Tip for Enums
If you need access to the keys or values of an enum, you can use the following syntax:
```ts
Object.keys(Subjects) // [ 'ALL', 'INTEGRATIVE_CONSERVATION', 'AFRICANA_STUDIES', ... ]
Object.values(Subjects) // [ '0', '9IIC', 'AFST', ... ]
```

### Course Class
When course data is fetched, it is returned as an array of Course classes.
Properties have been cleaned and cast to their respective types.  
Courses have the following methods: `isOpen(): boolean`  

A course is structured like this:
```ts
class Course {
    public crn: number;
    public id: string;
    public attributes: Array<string>;
    public title: string;
    public instructor: string;
    public credits: number;
    public times: string;
    public enrollment: { projected: number; current: number; available: number; };
    public status: string;
}
```

### Additional Methods
#### `terms(): Promise<number[]>`
Finds all listed terms on the Open Course List.
```ts
await scraper.terms() // [ 202320, 202310 ]
```




### Author
Jason LaPierre ([jalapierre@wm.edu](mailto:jalapierre@wm.edu))  
Biology '25

Please feel free to reach out to me with any questions or suggestions! 👏👏
