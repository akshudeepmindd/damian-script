var spawn = require('child_process').spawn
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk')
// Set the region
AWS.config.update({
  credentials: {
    accessKeyId: 'AKIAXQH5EYSDJKFWF6VK',
    secretAccessKey: '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',
  },
  region: 'ap-southeast-1',
})

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

;(async function example() {
  try {
    const lists = s3.listObjectsV2(
      {
        Bucket: 'vdyoencoded',
        Delimiter: '/',
        Prefix: 'video/74/',
      },
      (err, res) => {
        res.CommonPrefixes.map((item) => {
          let fileName = item.Prefix.split('/')
          var cmd = '/usr/bin/ffmpeg'

          var args = [
            '-y',
            '-i',
            `https://vdyoencoded.s3-ap-southeast-1.amazonaws.com/${item.Prefix}play.m3u8`,
            '-s',
            '1024x576',
            '-codec:a',
            'aac',
            '-b:a',
            '44.1k',
            '-r',
            '15',
            '-b:v',
            '1000k',
            '-c:v',
            'h264',
            '-f',
            'mp4',
            `${fileName[2]}.mp4`,
          ]

          var proc = spawn(cmd, args)

          proc.stdout.on('data', function (data) {
            console.log(data)
          })

          proc.stderr.setEncoding('utf8')
          proc.stderr.on('data', function (data) {
            console.log(data)
          })

          proc.on('close', function () {
            console.log('finished')
          })
        })
      }
    )
  } catch (e) {
    console.log(e, 'eeee')
    // await driver.quit()
  }
})()
