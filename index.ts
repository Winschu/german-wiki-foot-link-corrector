import {AxiosResponse} from "axios";
import * as dotenv from "dotenv";

import {ApiEditResponse, Mwn} from "mwn";
import axios from "axios";

const config: dotenv.DotenvConfigOutput = dotenv.config({path: '.env'});

if (config.error) {
    throw config.error;
}

console.time("Request");

const wikiLang: string = "de";

const bot: Mwn = await Mwn.init({
    apiUrl: `https://${wikiLang}.wikipedia.org/w/api.php`,

    OAuth2AccessToken: process.env.TOKEN,

    userAgent: `${process.env.USERNAME}/1.0 (https://${wikiLang}.wikipedia.org/wiki/Benutzer:${process.env.USERNAME})`,

    defaultParams: {
        assert: 'user'
    }
});

bot.setOptions({
    silent: false,
    retryPause: 5000,
    maxRetries: 3
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const dataUrl: string = "https://petscan.wmflabs.org/?labels%5Fno=&ores%5Fprob%5Fto=&search%5Fmax%5Fresults=500&after=&wikidata%5Fsource%5Fsites=&sitelinks%5Fyes=&regexp%5Ffilter=&minlinks=&maxlinks=&outlinks%5Fyes=&show%5Fredlinks=on&ns%5B0%5D=1&article%5Fredlinks%5Fonly=on&min%5Fredlink%5Fcount=1&output%5Flimit=&edits%5Banons%5D=both&larger=&combination=subset&outlinks%5Fany=&subpage%5Ffilter=either&wikidata%5Fitem=no&doit=Do%20it%21&depth=10&referrer%5Furl=&source%5Fcombination=&search%5Fquery=&sparql=&wikidata%5Flabel%5Flanguage=&cb%5Flabels%5Fno%5Fl=1&format=wiki&templates%5Fany=&sortby=title&templates%5Fyes=&categories=Fu%C3%9Fball&output%5Fcompatability=catscan&ores%5Fprediction=any&templates%5Fno=&labels%5Fyes=&ores%5Ftype=any&smaller=&outlinks%5Fno=&language=de&search%5Fwiki=&langs%5Flabels%5Fany=&links%5Fto%5Fno=&sitelinks%5Fno=&langs%5Flabels%5Fyes=&langs%5Flabels%5Fno=&max%5Fage=&before=&cb%5Flabels%5Fyes%5Fl=1&common%5Fwiki%5Fother=&manual%5Flist=&referrer%5Fname=&wikidata%5Fprop%5Fitem%5Fuse=&interface%5Flanguage=en&edits%5Bbots%5D=both&project=wikipedia&links%5Fto%5Fany=&active%5Ftab=tab%5Foutput&sortorder=ascending&cb%5Flabels%5Fany%5Fl=1&pagepile=&labels%5Fany=&max%5Fsitelink%5Fcount=&links%5Fto%5Fall=&negcats=&page%5Fimage=any&ores%5Fprob%5Ffrom=&manual%5Flist%5Fwiki=&wpiu=any&show%5Fredirects=both&sitelinks%5Fany=&min%5Fsitelink%5Fcount=&common%5Fwiki=auto&edits%5Bflagged%5D=both"

const alphabet: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

axios.get(dataUrl)
    .then(async (response: AxiosResponse<string>): Promise<void> => {
        console.timeEnd("Request");
        const letterLines: string[] = [];
        const data: string = response.data
        let lines = data.split("\n");
        lines.splice(0, 4);

        console.time("Creating letter objects");

        const linesSet: Set<string> = new Set<string>(lines);
        linesSet.delete("|-");

        for (const l of alphabet) {
            console.time(`Letter ${l}`);

            letterLines[l] = [`{| class="wikitable sortable"`, `!Wanted!!Title`];

            for (const line of linesSet) {
                if (line.match(`\\|\\s\\d+\\s\\|{2}\\s\\[{2}[${l}]`)) {
                    letterLines[l].push("|-");
                    letterLines[l].push(line);
                    linesSet.delete(line);
                }
            }

            letterLines[l].push("|}");
            console.timeEnd(`Letter ${l}`)
        }

        console.timeEnd("Creating letter objects");

        await addToWiki(letterLines)
    })
    .catch((err: Error): void => {
        throw new Error(err.message);
    })

const addToWiki = async (lines: string[]): Promise<void> => {
    for (const l of alphabet) {

        console.time(`Letter ${l}`);
        const resp: ApiEditResponse = await bot.save(`Wikipedia:WikiProjekt Fußball/Linkkorrekturen/${l}`, lines[l].join('\n'), 'Liste aktualisiert', {
            minor: true
        });
        console.info("Response: ", resp);
        console.timeEnd(`Letter ${l}`);

        console.log("Delayed for 4 minutes.");

        await delay(60000 * 4);
    }
};
