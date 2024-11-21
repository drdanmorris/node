const fileLog = {}

function deriveLogNameFor(url) {
  return url.split('/').pop().split('?')[0]
}

function clearConsole() {
  console.clear()  
  process.stdout.write('\u001Bc\u001B[3J')
}

function updateLog() {
  clearConsole()
  console.log(`Intercepted Files:`)
  let maxLength = 0
  for(var prop in fileLog) {
    maxLength = Math.max(maxLength, prop.length)
  }
  console.log(''.padEnd(maxLength + 10, '-'))
  console.log(` ${'File'.padEnd(maxLength, ' ')}  Result`)
  console.log(''.padEnd(maxLength + 10, '-'))
  for(var prop in fileLog) {
    const file = prop.padEnd(maxLength, ' ')
    const color = fileLog[prop] === 'Replaced' ? '32' : '34'
    console.log(`\x1b[${color}m ${file}  ${fileLog[prop]} \x1b[0m`)
  }
}

export function auditInterception(url, replaced) {
  const name = deriveLogNameFor(url)
  fileLog[name] = replaced ? 'Replaced' : 'Default'
  setTimeout(() => updateLog(), 100)
}

