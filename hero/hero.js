const puppeteer = require('puppeteer-core');
var fs = require('fs');
var path = require('path');

function getClass(str) {
    let t = ''
    var reg = /class=[\"|'](.*?)[\"|'].*?/g 
    str.replace(reg, function ($0, $1) {
      let a = $1.split('-') || []
      t = a[a.length - 1]
    });
    return t;
  }

async function myCraw(){
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: false,
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", // puppeteer下载失败，所以下载puppeteer-core 再加上已经安装的chrome路径。
    })

    // https://pvp.qq.com/web201605/herodetail/106.shtml
    let list = [115, 134, 140, 142, 136, 153, 154, 155, 157, 174, 130, 105, 106, 108, 156, 162, 163, 110, 148, 173, 175, 146, 501, 150, 107, 144, 135, 113, 117, 120, 133, 128, 141, 182, 171, 109, 167, 169, 168, 170, 124, 112, 121, 125, 114, 118, 116, 123, 139, 127, 129, 119, 137, 126, 176, 179, 183, 186, 178, 131, 152, 166, 177, 180, 187, 189, 190, 191, 195, 149, 194, 196, 197, 199, 198, 193, 132, 111, 184, 192, 312, 503, 506, 564, 502, 505, 509, 511, 513, 515, 518, 508, 510, 538, 548, 536, 537, 540, 542, 504, 507, 522, 527, 528, 524, 523, 521, 525, 529, 531, 533, 534, 545, 544, 564]
    let nameType = [],types = []
    async function getDetail(index, len) {
        let searchName = list[index] || 0
        if (searchName) {
            let page = (await browser.newPage())
            await page.setViewport({
                width: 1920,
                height: 1080
            });
            var url = 'https://pvp.qq.com/web201605/herodetail/' + searchName + '.shtml'
            await page.goto(url);
            const name = await page.$eval('.cover-name',(el) => {
                return el.textContent
            });
            const type =  await page.$eval('.herodetail-sort',(el) => {
                return el.innerHTML
            });
            nameType.push(name)
            types.push(type)
            await page.close()
        }
        index++
        if (index < len) {
            getDetail(index, len)
        }else{
            writeFileData('mypaxi1.txt', JSON.stringify(nameType))
            writeFileData('mypaxi2.txt', JSON.stringify(types))
        }
    }
    getDetail(0, list.length);
}
// myCraw();

// 处理文件

function formatClass(){
    getFileData('mypaxi2.txt').then((res)=>{
        let list = res.map((v=>{
            return getClass(v)
        }))
        writeFileData('mypaxi3.txt', JSON.stringify(list))
    }).catch(e=>{
        console.log(e)
    })
    
}

formatClass();

function getFileData(file, type) {
    let items = [];
    return  new Promise((resolve, reject)=>{
       
        fs.readFile(file, {
            flag: 'r+',
            encoding: 'utf-8'
        }, function (err, data) {
            if (err) {
                reject()
                console.log("获取数据失败");
            } else {
                items = JSON.parse(data)
                resolve(items)
                console.log("获取数据成功");
            }
        })
      });
}

function writeFileData(file, data) {
    let tips = false;
    fs.writeFile(file, data, {
        flag: 'a',
        encoding: 'utf-8'
    }, function (error) {
        if (error) {
            throw error;
        } else {
            console.log("文件已保存", file);
            tips = true
        }
    });
    return tips;
}