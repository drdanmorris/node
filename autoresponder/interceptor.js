import puppeteer from 'puppeteer'
import btoa from 'btoa'

let handleRequest = () => Promise.resolve('')
let launchUrl, interceptionPatterns

function log(message) {
    console.log(message)
}

function getResponseHeaders(responseHeaders) {
    const newHeaders = []
    for (const [k,v] of Object.entries(responseHeaders)) {
        newHeaders.push(`${k}: ${v}`)
    }
    return newHeaders
}

function getShortUrlFor(url) {
    if (url.length > 100) {
        if (url.includes('?')) {
            return url.split('?')[0] + '?...'
        }
        return url.substring(0,97) + '...'
    }
    return url
}

async function interceptRequestsForPage(page) {
    if (page) {
        const interceptOptions = {}

        if (interceptionPatterns && interceptionPatterns.length) {
            interceptOptions.patterns = interceptionPatterns
        } else {
            interceptOptions.patterns = [{
                urlPattern: `${launchUrl}/*`,
                resourceType: "Script"
            },{
                urlPattern: `${launchUrl}/*`,
                resourceType: "Stylesheet"
            }]
        }

        interceptOptions.patterns.forEach(pattern => pattern.interceptionStage = 'HeadersReceived')

        console.log('interceptOptions', interceptOptions)
        
        const client = await page.target().createCDPSession();
        await client.send('Network.enable');
        await client.send('Network.setRequestInterception', interceptOptions);

        client.on('Network.requestIntercepted', async ({ interceptionId, request, responseHeaders}) => {
            const url = request.url
            const ctx = {url, client, interceptionId, responseHeaders}
            log(`\nIntercepted ${getShortUrlFor(url)}`)
            let newBody = await handleRequest(url)

            if (newBody) {
                replaceResponse(ctx, newBody)
            } else {
                continueRequest(ctx)
            }
        });
    } else {
        await Promise.resolve()
    }
}

function replaceResponse(ctx, body) {
    const newHeaders = getResponseHeaders(ctx.responseHeaders)
    ctx.client.send('Network.continueInterceptedRequest', {
        interceptionId: ctx.interceptionId,
        rawResponse: btoa('HTTP/1.1 200 OK' + '\r\n' + newHeaders.join('\r\n') + '\r\n\r\n' + body)
    });
}

function continueRequest(ctx) {
    ctx.client.send('Network.continueInterceptedRequest', {interceptionId: ctx.interceptionId})
}

export async function start(url, cbRequest, patterns) {
    launchUrl = url
    interceptionPatterns = patterns
    handleRequest = cbRequest || handleRequest

    const browser = await puppeteer.launch({
        headless:false, 
        defaultViewport:null,
        devtools: true,
        pipe: true,
        args: ['--window-size=1920,1170','--window-position=0,0']
    });

    const page = (await browser.pages())[0];
    page.goto(launchUrl)
    await interceptRequestsForPage(page);

    browser.on('targetcreated', async (target) => {
        const page = await target.page();
        await interceptRequestsForPage(page);
    })

    return page
}

