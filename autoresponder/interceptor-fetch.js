import puppeteer from 'puppeteer'
import btoa from 'btoa'

let handleRequest = () => Promise.resolve('')
let launchUrl, interceptionPatterns

function log(message) {
    console.log(message)
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

function getInterceptionOptions() {
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

    interceptOptions.patterns.forEach(pattern => {
        pattern.requestStage = pattern.requestStage || 'Response'
    })

    return interceptOptions
}

async function interceptRequestsForPage(page) {
    if (page) {
        const interceptOptions = getInterceptionOptions()

        console.log('interceptOptions', interceptOptions)
        
        const client = await page.target().createCDPSession();
        await client.send('Fetch.enable', interceptOptions);

        client.on('Fetch.requestPaused', async (requestParams) => {
            const {requestId,
                request,
                frameId,
                resourceType,
                responseErrorReason,
                responseStatusCode,
                responseStatusText,
                responseHeaders,
                networkId,
                redirectedRequestId} = requestParams
            
            const url = request.url
            const ctx = {url, client, requestId, responseHeaders}
            
            log(`\nIntercepted ${getShortUrlFor(url)} (${requestId})`)
            log(`responseHeaders: ${JSON.stringify(responseHeaders)}`)

            if (responseHeaders) {
                const newBody = await handleRequest(url)
                if (newBody) {
                    replaceResponse(ctx, newBody)
                    return
                }
            }

            continueRequest(ctx)
        });
    } else {
        await Promise.resolve()
    }
}

function replaceResponse(ctx, body) {
    log(`Replacing response for ${getShortUrlFor(ctx.url)} (${ctx.requestId})`)
    ctx.client.send('Fetch.fulfillRequest', {
        requestId: ctx.requestId,
        responseCode: 200,
        body: btoa(body)
    });
}

function continueRequest(ctx) {
    ctx.client.send('Fetch.continueRequest', {requestId: ctx.requestId})
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

