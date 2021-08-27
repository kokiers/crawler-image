const puppeteer = require('puppeteer-core');
var fs = require('fs');
var md5 = require('js-md5');
var path = require('path');
var request = require('request');


function sleep(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(1)
      } catch (e) {
        reject(0)
      }
    }, delay)
  })
}


puppeteer.launch({
  ignoreHTTPSErrors:true, 
  headless:false,
  slowMo:250, 
  timeout:1000,
  executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", // puppeteer下载失败，所以下载puppeteer-core 再加上已经安装的chrome路径。
  args: ['--no-sandbox'], 
  dumpio: false
}).then(async browser => {

  let resWord= ['橘子','香蕉','西瓜','怪兽'], dataLink = []

  for (var i = 0; i < resWord.length; i++) {
    let searchName = resWord[i]
    let page = await browser.newPage();
    page.setJavaScriptEnabled(true);
    await page.setViewport({width:1920, height:1080});
    var url = 'https://pixabay.com/zh/images/search/' + encodeURI(searchName) //+ '?min_width=500&min_height=250' 
    await page.goto(url);

    let scrollStep = 500; 
    let stepNum = 0
    while (stepNum < 4) {
      stepNum++
      await page.evaluate((scrollStep) => {
        let scrollTop = document.scrollingElement.scrollTop;
        document.scrollingElement.scrollTop = scrollTop + scrollStep;
      }, scrollStep);
      await sleep(100);
    }

    const resultsSelector = '.container--3NC_b a.link--h3bPW img';
    await page.waitForSelector(resultsSelector);

    const links = await page.evaluate((resultsSelector) => {
      const anchors = Array.from(document.querySelectorAll(resultsSelector));
      return anchors.map((link) => {
        return {
          src: link.src,
          title: link.alt,
        }
      });
    }, resultsSelector);

    dataLink.push({
      links:links,
      name: searchName,
    })
    await page.close()
  }
  // 1、写入文件保存，再读文件下载。 
  writeFileData('mypaxi.txt',JSON.stringify(dataLink))
  // 2、或者直接下载
  saveDataImg(dataLink)

  await browser.close();
});




function getFileData (file,type) {
    let items = [];
    fs.readFile(file,{flag:'r+',encoding:'utf-8'},function(err,data){
        if(err){
            console.log("获取数据失败");
        }else{
            console.log("获取数据成功");
            saveDataImg(JSON.parse(data))
        }
    })
    return items;
}

function saveDataImg(datas) {

  datas.forEach(items=>{
    let {links,name} = items
    mkdir('./' + name)
    links.forEach(val=>{
      savedImg(val,name)
    })
  })
}

// getFileData('./mypaxi.txt','json')


function savedImg(arg, dir) {
  var img_filename = md5(arg['title']) + '.jpg';
  var img_src = arg['src'];

  //if https add refer
  request.head(img_src + '?f=jahah', function(err, res, body) {
    if (err) {
      console.log(err);
    }
  });
  var writable = fs.createWriteStream(dir + '/' + img_filename);
  request(img_src).pipe(writable);

  writable.on('finish', function() {
    console.log('保存完毕')
  })

}


function mkdir(dirpath, dirname) {
  if (typeof dirname === "undefined") {
    if (fs.existsSync(dirpath)) {
      return;
    } else {
      mkdir(dirpath, path.dirname(dirpath));
    }
  } else {
    if (dirname !== path.dirname(dirpath)) {
      mkdir(dirpath);
      return;
    }
    if (fs.existsSync(dirname)) {
      fs.mkdirSync(dirpath)
    } else {
      mkdir(dirname, path.dirname(dirname));
      fs.mkdirSync(dirpath);
    }
  }
}

function writeFileData(file, data) {
  let tips = false;
  fs.writeFile(file, data, {flag:'a',encoding:'utf-8'},function(error) {
    if (error) {
      throw error;
    } else {
      console.log("文件已保存", file);
      tips = true
    }
  });
  return tips;
}