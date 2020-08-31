require('./node_modules/node-cmd/cmd.js')
var cmd = require('node-cmd')
const fs = require('fs')
var AWS = require('aws-sdk')
// Set the region
require('dotenv').config()
console.log(process.env.ACCESS_KEY, 'accesskey')
AWS.config.update({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SCERET_KEY,
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
          var proc = cmd.run(
            `ffmpeg -i https://vdyoencoded.s3-ap-southeast-1.amazonaws.com/${item.Prefix}play.m3u8 -bsf:a aac_adtstoasc -vcodec copy -c copy ${fileName[2]}.mp4`
          )

          //var proc = spawn(cmd, args)

          proc.stdout.on('data', function (data) {
            console.log(data)
          })

          proc.stderr.setEncoding('utf8')
          proc.stderr.on('data', function (data) {
            console.log(data)
          })

          proc.on('close', function (data) {
            console.log(data, 'finished')
            const fileContent = fs.readFileSync(`${fileName[2]}.mp4`)

            // Setting up S3 upload parameters
            const params = {
              Bucket: 'convertedvydo',
              Key: `${fileName[2]}.mp4`, // File name you want to save as in S3
              Body: fileContent,
            }

            // Uploading files to the bucket
            s3.upload(params, function (err, data) {
              if (err) {
                throw err
              }
              let deleteproc = cmd.run(`rm -rf ${fileName[2]}.mp4`)
              deleteproc.stdout.on('data', function (data) {
                console.log(data)
              })
              deleteproc.stderr.setEncoding('utf8')
              deleteproc.stderr.on('data', function (data) {
                console.log(data)
              })
              deleteproc.on('close', function (data) {
                console.log('deleted')
              })
              console.log(`File uploaded successfully. ${data.Location}`)
            })
          })
        })
      }
    )
  } catch (e) {
    console.log(e, 'eeee')
    // await driver.quit()
  }
})()
