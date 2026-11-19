import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. The comprehensive updated gallery list from https://gurukulbhose.com/#gallery-home
export const newGalleryList = [
  // Campus
  {
    id: "gal-campus-1",
    category: "campus",
    title: "गुरुकुल भोसे निसर्गरम्य ४ एकर शैक्षणिक संकुल",
    caption: "प्रदूषणमुक्त, हिरवेगार आणि सुरक्षित निसर्गरम्य शालेय परिसर",
    imageUrl: "/images/gallery/campus-slide-1.jpg"
  },
  {
    id: "gal-campus-2",
    category: "campus",
    title: "गुरुकुल मुख्य इमारत व भव्य परेड ग्राउंड",
    caption: "सैनिक शिस्त, रोजची कवायत आणि शैक्षणिक वर्गांचे संकुल",
    imageUrl: "/images/gallery/campus-slide-2.jpg"
  },
  {
    id: "gal-campus-3",
    category: "campus",
    title: "सैनिक पॅटर्न वसतिगृह व कॅम्पस परिसर",
    caption: "विद्यार्थ्यांसाठी निवासी सुविधा, मेस व प्रशस्त अभ्यास कक्ष",
    imageUrl: "/images/gallery/campus-slide-3.jpg"
  },
  {
    id: "gal-campus-4",
    category: "campus",
    title: "गुरुकुल निसर्गरम्य खेळाचे मैदान",
    caption: "विद्यार्थ्यांच्या शारीरिक तंदुरुस्तीसाठी विस्तीर्ण क्रीडांगण",
    imageUrl: "/images/gallery/campus-slide-4.jpg"
  },
  {
    id: "gal-campus-5",
    category: "campus",
    title: "गुरुकुल भोसे सुसज्ज सोयीसुविधा व कॅम्पस इन्फ्रास्ट्रक्चर",
    caption: "आधुनिक शिक्षण, सुरक्षित वातावरण आणि सर्वांगीण विकासाचे केंद्र",
    imageUrl: "/images/gallery/campus-features.jpeg"
  },

  // Activities (1-9)
  {
    id: "gal-act-1",
    category: "activities",
    title: "शालेय उपक्रम व विद्यार्थ्यांचे सहभाग - १",
    caption: "विविध शैक्षणिक व कलागुणांना वाव देणारे शालेय उपक्रम",
    imageUrl: "/images/gallery/activities-1.jpeg"
  },
  {
    id: "gal-act-2",
    category: "activities",
    title: "विद्यार्थी कार्यशाळा व प्रात्यक्षिके - २",
    caption: "शिकण्याची आवड व प्रत्यक्ष कृतीतून ज्ञान देणारे उपक्रम",
    imageUrl: "/images/gallery/activities-2.jpeg"
  },
  {
    id: "gal-act-3",
    category: "activities",
    title: "सांस्कृतिक व सामाजिक संस्कार उपक्रम - ३",
    caption: "संस्कार आणि नैतिक मूल्यांची रुजवणूक करणारे विशेष सत्र",
    imageUrl: "/images/gallery/activities-3.jpeg"
  },
  {
    id: "gal-act-4",
    category: "activities",
    title: "शालेय स्पर्धा व विद्यार्थी सहभाग - ४",
    caption: "नेतृत्व व संवाद कौशल्य वाढवणारे उपक्रम",
    imageUrl: "/images/gallery/activities-4.jpeg"
  },
  {
    id: "gal-act-5",
    category: "activities",
    title: "गुरुकुल उपक्रम व गट कार्य - ५",
    caption: "सहकार्य, एकोपा आणि सांघिक भावना वाढवणारे वर्ग उपक्रम",
    imageUrl: "/images/gallery/activities-5.jpeg"
  },
  {
    id: "gal-act-6",
    category: "activities",
    title: "ज्ञानरचनावादी शिक्षण व उपक्रम - ६",
    caption: "विद्यार्थ्यांचा उत्स्फूर्त सहभाग आणि मार्गदर्शक शिक्षक",
    imageUrl: "/images/gallery/activities-6.jpeg"
  },
  {
    id: "gal-act-7",
    category: "activities",
    title: "विशेष दिन व सण उत्सव साजरा - ७",
    caption: "भारतीय संस्कृती, परंपरा व राष्ट्रभक्तीचे संस्कार",
    imageUrl: "/images/gallery/activities-7.jpeg"
  },
  {
    id: "gal-act-8",
    category: "activities",
    title: "शालेय शिबिर व व्यक्तिमत्त्व विकास - ८",
    caption: "आत्मविश्वास, वक्तृत्व आणि कलागुण संवर्धन",
    imageUrl: "/images/gallery/activities-8.jpeg"
  },
  {
    id: "gal-act-9",
    category: "activities",
    title: "विद्यार्थी गौरव व कौतुक सोहळा - ९",
    caption: "उपक्रमांमध्ये उत्कृष्ट कामगिरी करणाऱ्या विद्यार्थ्यांचा सन्मान",
    imageUrl: "/images/gallery/activities-9.jpeg"
  },

  // Gathering (1-9)
  {
    id: "gal-gath-1",
    category: "gathering",
    title: "वार्षिक स्नेहसंमेलन रंगारंग उद्घाटन - १",
    caption: "गुरुकुल भोसे वार्षिक स्नेहसंमेलन व सांस्कृतिक सोहळा",
    imageUrl: "/images/gallery/gathering-1.jpeg"
  },
  {
    id: "gal-gath-2",
    category: "gathering",
    title: "सांस्कृतिक नृत्य व नाट्य सादरीकरण - २",
    caption: "विद्यार्थ्यांचे उत्कृष्ट रंगमंचीय नृत्य व अभिनय",
    imageUrl: "/images/gallery/gathering-2.jpeg"
  },
  {
    id: "gal-gath-3",
    category: "gathering",
    title: "पारंपरिक वेशभूषा व देशभक्तीपर सादरीकरण - ३",
    caption: "शिवकालीन इतिहास व राष्ट्रभक्तीवर आधारित सांस्कृतिक कार्यक्रम",
    imageUrl: "/images/gallery/gathering-3.jpeg"
  },
  {
    id: "gal-gath-4",
    category: "gathering",
    title: "विद्यार्थ्यांचे समूह नृत्य व कलाविष्कार - ४",
    caption: "रंगीबेरंगी पोशाखात विद्यार्थ्यांचे लयबद्ध समूह नृत्य",
    imageUrl: "/images/gallery/gathering-4.jpeg"
  },
  {
    id: "gal-gath-5",
    category: "gathering",
    title: "स्नेहसंमेलन मुख्य मंच सादरीकरण - ५",
    caption: "पालक, पाहुणे व शिक्षकांच्या उपस्थितीत भव्य सांस्कृतिक संध्या",
    imageUrl: "/images/gallery/gathering-5.jpeg"
  },
  {
    id: "gal-gath-6",
    category: "gathering",
    title: "नाट्यछटा व प्रहसन सादरीकरण - ६",
    caption: "सामाजिक संदेश देणारी विद्यार्थ्यांची नाट्य प्रस्तुती",
    imageUrl: "/images/gallery/gathering-6.jpeg"
  },
  {
    id: "gal-gath-7",
    category: "gathering",
    title: "विद्यार्थी कलागुण दर्शन - ७",
    caption: "गायन, वादन आणि लोकनृत्यांचे अप्रतिम सादरीकरण",
    imageUrl: "/images/gallery/gathering-7.jpeg"
  },
  {
    id: "gal-gath-8",
    category: "gathering",
    title: "वार्षिक स्नेहसंमेलन पारितोषिक वितरण - ८",
    caption: "सांस्कृतिक स्पर्धांमध्ये विजेत्या विद्यार्थ्यांचा मान्यवरांच्या हस्ते सत्कार",
    imageUrl: "/images/gallery/gathering-8.jpeg"
  },
  {
    id: "gal-gath-9",
    category: "gathering",
    title: "स्नेहसंमेलन समारोप व राष्ट्रगीत - ९",
    caption: "आनंददायी आठवणींसह वार्षिक स्नेहसंमेलनाचा दिमाखदार समारोप",
    imageUrl: "/images/gallery/gathering-9.jpeg"
  },

  // Sports (1-7)
  {
    id: "gal-sport-1",
    category: "sports",
    title: "सैनिक पॅटर्न मैदानी सराव व परेड - १",
    caption: "कडक शिस्त, शारीरिक कवायत व मार्चपास्ट प्रात्यक्षिके",
    imageUrl: "/images/gallery/sports-1.jpeg"
  },
  {
    id: "gal-sport-2",
    category: "sports",
    title: "क्रीडांगण सराव व रनिंग ट्रॅक - २",
    caption: "धावणे, शारीरिक लवचिकता आणि स्टॅमिना वाढवणारा सराव",
    imageUrl: "/images/gallery/sports-2.jpeg"
  },
  {
    id: "gal-sport-3",
    category: "sports",
    title: "मैदानी खेळ व सांघिक स्पर्धा - ३",
    caption: "कबड्डी, खो-खो, व्हॉलीबॉल आणि फुटबॉल स्पर्धा सराव",
    imageUrl: "/images/gallery/sports-3.jpeg"
  },
  {
    id: "gal-sport-4",
    category: "sports",
    title: "शारीरिक तंदुरुस्ती व अडथळा शर्यत (Obstacle Course) - ४",
    caption: "सैनिक भरती व कमांडो पॅटर्न अडथळा प्रशिक्षण",
    imageUrl: "/images/gallery/sports-4.jpeg"
  },
  {
    id: "gal-sport-5",
    category: "sports",
    title: "कमांडो ट्रेनिंग व कवायत प्रात्यक्षिके - ५",
    caption: "सैनिक पॅटर्न शिस्त आणि मानसिक कणखरतेचे धडे",
    imageUrl: "/images/gallery/sports-5.jpeg"
  },
  {
    id: "gal-sport-6",
    category: "sports",
    title: "क्रीडा स्पर्धा व विजय जल्लोष - ६",
    caption: "विभागीय व जिल्हास्तरीय क्रीडा स्पर्धांमध्ये गुरुकुलचे यश",
    imageUrl: "/images/gallery/sports-6.jpeg"
  },
  {
    id: "gal-sport-7",
    category: "sports",
    title: "वार्षिक क्रीडा महोत्सव व संचलन - ७",
    caption: "विद्यार्थ्यांचे शिस्तबद्ध संचलन व क्रीडा कौशल्यांचे सादरीकरण",
    imageUrl: "/images/gallery/sports-7.jpeg"
  },

  // Result (1)
  {
    id: "gal-res-1",
    category: "result",
    title: "गुरुकुल भोसे १००% निकालाची गौरवशाली परंपरा",
    caption: "एसएससी व बोर्ड परीक्षेत दैदिप्यमान यश मिळवणारे गुणवंत विद्यार्थी",
    imageUrl: "/images/gallery/result-1.jpeg"
  },

  // Yoga
  {
    id: "gal-yoga-1",
    category: "yoga",
    title: "कॅम्पस योगा व ध्यान सत्र",
    caption: "सकाळी ५:३० वाजता सुरू होणारे योग व प्राणायाम सत्र",
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gal-yoga-2",
    category: "yoga",
    title: "विद्यार्थी सूर्यनमस्कार व प्रात्यक्षिके",
    caption: "सकाळच्या दिनचर्येतील १२ सूर्यनमस्कार व शारीरिक लवचिकता सराव",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gal-yoga-3",
    category: "yoga",
    title: "प्राणायाम व ओंकार ध्यान साधना",
    caption: "अभ्यासात एकाग्रता, स्मरणशक्ती व आत्मविश्वासासाठी दैनंदिन ध्यानधारणा",
    imageUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gal-yoga-4",
    category: "yoga",
    title: "आंतरराष्ट्रीय योग दिन विशेष सत्र",
    caption: "२१ जून - गुरुकुल भोसे विद्यार्थी व शिक्षकांचा भव्य योग दिन उपक्रम",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
  }
];

// Helper to replace galleryList in initialData.js files
function updateInitialDataFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const formattedGallery = `export const galleryList = ${JSON.stringify(newGalleryList, null, 2)};`;
  const regex = /export const galleryList = \[[\s\S]*?\];/m;
  
  if (!regex.test(content)) {
    console.error(`❌ Could not find galleryList in ${filePath}`);
    return false;
  }
  
  content = content.replace(regex, formattedGallery);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated galleryList in ${filePath}`);
  return true;
}

async function updateFirestore() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[k] = v;
      }
    }
  }

  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`\n========================================`);
  console.log(`🔄 Updating Cloud Firestore 'gallery' Collection...`);
  console.log(`========================================\n`);

  // Fetch existing docs in gallery
  const existingSnapshot = await getDocs(collection(db, 'gallery'));
  const currentIds = new Set(newGalleryList.map(g => g.id));

  // Delete obsolete docs that are not in newGalleryList
  for (const docSnap of existingSnapshot.docs) {
    if (!currentIds.has(docSnap.id)) {
      console.log(`🗑️ Removing obsolete document: ${docSnap.id}`);
      await deleteDoc(doc(db, 'gallery', docSnap.id));
    }
  }

  // Push new/updated docs
  for (let i = 0; i < newGalleryList.length; i++) {
    const item = newGalleryList[i];
    const docData = {
      id: item.id,
      imageId: item.id,
      title: item.title,
      caption: item.caption,
      category: item.category,
      imageUrl: item.imageUrl,
      url: item.imageUrl,
      displayOrder: i + 1,
      status: 'published',
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'gallery', item.id), docData, { merge: true });
    console.log(`✓ [${i + 1}/${newGalleryList.length}] Saved ${item.id} (${item.category}): ${item.title}`);
  }

  console.log(`\n✅ Successfully synced all ${newGalleryList.length} items into Cloud Firestore 'gallery'!`);
}

async function main() {
  console.log(`\n========================================`);
  console.log(`🚀 Updating Codebase and Firestore with authentic photos...`);
  console.log(`========================================\n`);

  // Update initialData.js in both locations
  updateInitialDataFile(path.join(rootDir, 'shared', 'data', 'initialData.js'));
  updateInitialDataFile(path.join(rootDir, 'src', 'data', 'initialData.js'));

  // Update Firestore
  try {
    await updateFirestore();
  } catch (err) {
    console.error('❌ Error syncing to Firestore:', err.message);
  }

  console.log('\nAll updates completed!');
}

main();
