const http = require('http');
const request = require('request')
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

let addSet = new Set([])
let delSet = new Set([])

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
    let data = JSON.parse(res.data)
    
    for (let img of data.images) {
      if (img.type === "add") {
        if (!added.has(img.id)) {
          addSet.add(img.id)
          if (addSet.size === 50) {
            addProcess(Array.from(addSet))
            addSet.clear()
          }
        }
      } else {
       if (!deleted.has(img.id)) {
          delSet.add(img.id)
          if (delSet.size === 50) {
            deleteProcess(Array.from(delSet))
            delSet.clear()
          }
       }
      }
    }

    getDocument(data.next_url)
  })
  .catch(err => {
    console.error(err)
    getDocument(path)
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
  .catch(err => {
    console.log(err)
    addProcess(ids)
  })
  .then(res => {
    for (let id of ids) {
      added.add(id)
    }
  })
  .catch(err => {
    console.error(err)
    addProcess(ids)
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
  reqeust({
    uri: 'http://api.welcome.kakao.com/image/feature',
    method: 'DELETE',
    headers: { 'X-Auth-Token': options.headers['X-Auth-Token'] },
    body: JSON.stringify(data)
  }, (err, res, body) => {
    if (err) {
      console.error(err)
      deleteProcess(ids)
    } else if (res) {
      // completed to delete
    }
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
  .catch(err => {
    console.error(err)
  })