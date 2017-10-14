const http = require('http');
const loginToken = 'UwQj0wXXKDqbYSXQrMVd8D3GBcn20r1gKw2kgcQrk3M';
let options = {
    hostname: 'api.welcome.kakao.com',
    path: '/',
    method: 'GET',
    headers: {
        'X-Auth-Token': ''
    }
}

let httpRequester = (params, data) => {
  return new Promise((resolve, reject) => {
    let req = http.request(params, res => {
      let ret = "";
      res.on('data', chunk => {
        ret += chunk;
      })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: ret
        });
      })
    })
    req.on('error', err => {
      reject(err)
    })
    if (data) {
      if (typeof(data) === "object") {
        req.write(JSON.stringify(data))
      } else if (typeof(data) == "string") {
        req.write(data)
      }
    }
    req.end()
  })
}

let addQueue = new Set([])
let delQueue = new Set([])

let added = new Set([])
let deleted = new Set([])

let SeedProc = () => {
  options.path = "/seed"
  options.method = "GET"
  httpRequester(options)
  .then(res => {
    let paths = res.data.split('\n')
    let request_list = [];
    for(let i of paths) {
      if (!i) continue;
      getDocument(i);
    }
  })
  .catch(e => {
    console.error(e)
  })
}

let getDocument = (path) => {
  options.path = path
  options.method = "GET"
  httpRequester(options, {})
  .then(res => {
    if (res.statusCode !== 200) {
      
    }
    let data = JSON.parse(res.data)
    
    for (let img of data.images) {
      if (img.type === "add") {
        if (!added.has(img.id)) {
          addQueue.add(img.id)
          if (addQueue.size === 50) {
            addProcess(Array.from(addQueue))
            addQueue.clear()
          }
        }
      } else {
       if (!deleted.has(img.id)) {
          delQueue.add(img.id)
          if (delQueue.size === 50) {
            deleteProcess(Array.from(delQueue))
            delQueue.clear()
          }
       }
      }
    }

    getDocument(data.next_url)
  })
}

let addProcess = (ids) => {
  options.path = "/image/feature?id=" + ids.join()
  options.method = "GET"
  httpRequester(options, {})
  .then(res => {
    options.path = "/image/feature"
    options.method = "POST"
    return httpRequester(options, res.data.replace('features', 'data'))
  })
  .then(res => {
    for (let id of ids) {
      added.add(id)
    }
    console.log("added Queue size : " + added.size)
  })
}

let deleteProcess = (ids) => {
  options.path = "/image/feature"
  options.method = "DELETE"
  let data = {}
  data.data = []
  for (let id of ids) { 
    data.data.push({id: id})
  }
  httpRequester(options, data)
  .then(res => {
    for(let id of ids) {
      deleted.add(id)
    }
    console.log("deleted Queue size : " + deleted.size)
  })
}

// get Query Token
options.path = "/token/" + loginToken
options.method = "GET"
httpRequester(options, {})
  .then(res => {
    options.headers['X-Auth-Token'] = res.data
    SeedProc()
  })