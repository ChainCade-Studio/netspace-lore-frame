// import dotenv from 'dotenv';
// dotenv.config({path: '.env'});

import {serve} from '@hono/node-server'
import {serveStatic} from '@hono/node-server/serve-static'
import {Button, Frog} from 'frog'
import {devtools} from 'frog/dev'
// import { neynar } from 'frog/hubs'

import loreData from "./lore.json";


// const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || ''

export const app = new Frog({
    // Supply a Hub to enable frame verification.
    verify: "silent",
    basePath: '/lore',
    // hub: neynar({ apiKey: NEYNAR_API_KEY }),
})

app.use('/*', serveStatic({root: './public'}))

app.frame('/', (c) => {
    const {buttonValue,status} = c

    const lorePage = buttonValue ?
        loreData.find((page) => page.name === buttonValue)
        : loreData[0]

    if (!lorePage) {
        return c.res({
            action: '/',
            image: (<div> something went wrong! This is so broken!</div>),
            intents: [],
        })
    }
    else{
        const currentPageIndex = loreData.indexOf(lorePage)
        //the request's url + the lore page's image url
        const pageImageUrl = `https://frames.chaincade.com/${lorePage.image}`

        //find the lore page in the loreData array
        const index = loreData.indexOf(lorePage)
        let nextPage = loreData[index+1]

        if (!nextPage)
        {
            nextPage = loreData[1]
        }

        let prevPage = loreData[index-1]

        if (!prevPage)
        {
            prevPage = loreData[loreData.length-1]
        }

        let latestIndex = loreData.length-1
        let latestPage = loreData[latestIndex]

        if(!latestPage)
        {
            latestPage = loreData[1]
        }

        return c.res({
            action: `/`,
            image: (pageImageUrl),
            intents: [
                status != 'response' && <Button value={latestPage.name}>Latest : {latestPage.name}</Button>,
                status === 'response' && currentPageIndex == 1 && <Button.Reset>Home</Button.Reset>,
                status === 'response' && currentPageIndex > 1 &&<Button value={`${prevPage.name}`}>&larr; {prevPage.name}</Button>,
                currentPageIndex < loreData.length-1 && <Button value={`${nextPage.name}`}>{nextPage.name} &rarr;</Button>,
                status === 'response' && currentPageIndex == loreData.length-1 && <Button.Reset>Home</Button.Reset>,
                status === 'response' && currentPageIndex == loreData.length-1 && <Button.Link href={"https://warpcast.com/~/channel/xd"}>Join XD</Button.Link>
            ],
        })
    }
})

const port = 3200
console.log(`Server is running on port ${port}`)

devtools(app, {serveStatic})

serve({
    fetch: app.fetch,
    port,
})
