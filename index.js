import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import qrcode from 'qrcode';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCBy-KVsXrQZ-mU4Wu53MrzIc1dmsBTULg",
  authDomain: "registro-estancias.firebaseapp.com",
  projectId: "registro-estancias",
  storageBucket: "registro-estancias.appspot.com",
  messagingSenderId: "741516151149",
  appId: "1:741516151149:web:15f2901a79e946cbbdf264",
  measurementId: "G-EFR0LDDJ3M"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inicializar Express
const server = express();
const port = process.env.PORT || 3001;

// Habilitar CORS
server.use(cors());

// Servir archivos estáticos de Angular
const __dirname = path.resolve();
const distDir = path.join(__dirname, 'dist');
server.use(express.static(distDir));

// Endpoints de la API REST

// Endpoint para obtener estancia al azar y generar QR
server.get('/api/random-stay', async (req, res) => {
  try {
    const randomId = Math.floor(Math.random() * 30) + 1;
    const docRef = doc(db, "estancias", String(randomId));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const estanciaData = docSnap.data();
      const qr = await qrcode.toDataURL(JSON.stringify(estanciaData));
      res.json({ data: estanciaData, qr });
    } else {
      res.status(404).json({ message: "No se encontró la estancia" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint para contar los usuarios en la colección "users"
server.get('/api/user-count', async (req, res) => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const userCount = usersSnapshot.size;
    res.json({ userCount });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint para sumar todos los precios en la colección "places"
server.get('/api/total-revenue', async (req, res) => {
  try {
    const placesCollection = collection(db, "places");
    const placesSnapshot = await getDocs(placesCollection);
    let totalRevenue = 0;

    placesSnapshot.forEach(doc => {
      const estancia = doc.data().estancia;
      if (estancia && typeof estancia.precio === 'number') {
        totalRevenue += estancia.precio;
      }
    });

    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint para obtener el top 3 de estancias más repetidas
server.get('/api/top-estancias', async (req, res) => {
  try {
    const placesCollection = collection(db, "places");
    const placesSnapshot = await getDocs(placesCollection);
    const estanciaCount = {};

    placesSnapshot.forEach(doc => {
      const estancia = doc.data().estancia;
      if (estancia && typeof estancia.nombre === 'string') {
        const nombre = estancia.nombre;
        if (!estanciaCount[nombre]) {
          estanciaCount[nombre] = 0;
        }
        estanciaCount[nombre]++;
      }
    });

    // Ordenar por cantidad y tomar los top 3
    const topEstancias = Object.entries(estanciaCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([nombre, count]) => ({ nombre, count }));

    res.json({ topEstancias });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint para obtener todos los correos electrónicos de la colección "users"
server.get('/api/user-emails', async (req, res) => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const emails = usersSnapshot.docs.map(doc => doc.data().email);
    res.json({ emails });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Redirigir todas las demás rutas al index.html de Angular
server.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`API and App are served on port ${port}`);
});
