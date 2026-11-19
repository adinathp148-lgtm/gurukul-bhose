import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, '../public/images/gallery');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const imagesToDownload = [
  // Activities (1-9)
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-1.jpeg', file: 'activities-1.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-2.jpeg', file: 'activities-2.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-3.jpeg', file: 'activities-3.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-4.jpeg', file: 'activities-4.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-5.jpeg', file: 'activities-5.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-6.jpeg', file: 'activities-6.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-7.jpeg', file: 'activities-7.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-8.jpeg', file: 'activities-8.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/activities-9.jpeg', file: 'activities-9.jpeg' },

  // Gathering (1-9)
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-1.jpeg', file: 'gathering-1.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-2.jpeg', file: 'gathering-2.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-3.jpeg', file: 'gathering-3.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-4.jpeg', file: 'gathering-4.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-5.jpeg', file: 'gathering-5.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-6.jpeg', file: 'gathering-6.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-7.jpeg', file: 'gathering-7.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-8.jpeg', file: 'gathering-8.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/gathering-9.jpeg', file: 'gathering-9.jpeg' },

  // Sports (1-7)
  { url: 'https://gurukulbhose.com/img/new-gallery/sports-1.jpeg', file: 'sports-1.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/sports-2.jpeg', file: 'sports-2.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/sports-3.jpeg', file: 'sports-3.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/sports-4.jpeg', file: 'sports-4.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/sports-5.jpeg', file: 'sports-5.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/sports-6.jpeg', file: 'sports-6.jpeg' },
  { url: 'https://gurukulbhose.com/img/new-gallery/sports-7.jpeg', file: 'sports-7.jpeg' },

  // Result (1)
  { url: 'https://gurukulbhose.com/img/new-gallery/result-1.jpeg', file: 'result-1.jpeg' },

  // Campus / Sliders
  { url: 'https://gurukulbhose.com/img/slider/parallaxslider/slide1.jpg', file: 'campus-slide-1.jpg' },
  { url: 'https://gurukulbhose.com/img/slider/parallaxslider/slide2.jpg', file: 'campus-slide-2.jpg' },
  { url: 'https://gurukulbhose.com/img/slider/parallaxslider/slide3.jpg', file: 'campus-slide-3.jpg' },
  { url: 'https://gurukulbhose.com/img/slider/parallaxslider/slide4.jpg', file: 'campus-slide-4.jpg' },
  { url: 'https://gurukulbhose.com/img/features.jpeg', file: 'campus-features.jpeg' }
];

function download(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(targetDir, item.file);
    const file = fs.createWriteStream(dest);

    https.get(item.url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stat = fs.statSync(dest);
          console.log(`✓ Downloaded ${item.file} (${stat.size} bytes)`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        console.error(`✗ Failed ${item.url} - Status ${response.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      console.error(`✗ Error downloading ${item.url}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log(`Starting download of ${imagesToDownload.length} images...`);
  for (const item of imagesToDownload) {
    await download(item);
  }
  console.log('Finished downloading gallery images!');
}

run();
