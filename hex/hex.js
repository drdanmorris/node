

process.openStdin().addListener("data", (d) => {
    const line = d.toString().replace('/n', '').trim()
    line.split('').forEach(c => {
        console.log(`${c} : ${c.charCodeAt(0)}`)
    })
    
    
})

