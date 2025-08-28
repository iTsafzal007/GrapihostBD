import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB6lLeCCR1sZBJWcwIjNANSdKuWM80RV6g",
    authDomain: "plp-website-a8778.firebaseapp.com",
    projectId: "plp-website-a8778",
    storageBucket: "plp-website-a8778.appspot.com",
    messagingSenderId: "1002143507316",
    appId: "1:1002143507316:web:5df06f11c470a13c368221"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uploadForm = document.getElementById('upload-form');
const typeSelect = document.getElementById('type');
const priceInput = document.getElementById('price');
const searchInput = document.getElementById('search-input');
const fileListContainer = document.getElementById('file-list');

let allFiles = []; // To store all files once and search locally

// Toggle price input based on type selection
typeSelect.addEventListener('change', () => {
    priceInput.style.display = typeSelect.value === 'paid' ? 'block' : 'none';
});

// --- RENDER FUNCTION (Shows files based on search) ---
function renderFiles(filesToRender) {
    fileListContainer.innerHTML = '';
    filesToRender.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <img src="${file.imageUrl}" alt="${file.title}">
            <div class="info">
                <strong>${file.title}</strong>
                <small style="display:block; color:${file.type === 'paid' ? '#ffc107' : '#28a745'}">${file.type}</small>
            </div>
            <div class="actions">
                <button class="edit-btn" data-id="${file.id}">Edit</button>
                <button class="delete-btn" data-id="${file.id}">Delete</button>
            </div>`;
        fileListContainer.appendChild(item);
    });
    // Add event listeners for the new buttons
    document.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', deleteFile));
    document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', editFile));
}

// --- SEARCH FUNCTIONALITY ---
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredFiles = allFiles.filter(file => file.title.toLowerCase().includes(searchTerm));
    renderFiles(filteredFiles);
});


// --- FETCH ALL FILES (Only once on page load) ---
async function fetchAllFiles() {
    fileListContainer.innerHTML = 'Loading...';
    const querySnapshot = await getDocs(collection(db, "plp_files"));
    allFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderFiles(allFiles);
}

// --- UPLOAD / UPDATE FILE ---
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const docId = document.getElementById('doc-id').value;
    const fileData = {
        title: document.getElementById('title').value,
        imageUrl: document.getElementById('imageUrl').value,
        type: document.getElementById('type').value,
        price: Number(priceInput.value) || 0,
        downloadUrl: document.getElementById('downloadUrl').value,
        seoKeywords: document.getElementById('seoKeywords').value.split(',').map(k => k.trim())
    };

    if (docId) { // Update existing file
        await updateDoc(doc(db, "plp_files", docId), fileData);
    } else { // Add new file
        await addDoc(collection(db, "plp_files"), fileData);
    }
    
    uploadForm.reset();
    document.getElementById('doc-id').value = '';
    document.getElementById('form-title').innerText = 'Add New PLP File';
    document.getElementById('submit-btn').innerText = 'Add File';
    priceInput.style.display = 'none';
    
    fetchAllFiles(); // Refresh the list
});

// --- DELETE FILE ---
async function deleteFile(e) {
    const id = e.target.dataset.id;
    if (confirm('Are you sure you want to delete this file?')) {
        await deleteDoc(doc(db, "pl-p_files", id));
        fetchAllFiles(); // Refresh the list
    }
}

// --- EDIT FILE ---
async function editFile(e) {
    const id = e.target.dataset.id;
    // Find the file data from our 'allFiles' array to avoid another database call
    const file = allFiles.find(f => f.id === id);

    if (file) {
        document.getElementById('doc-id').value = id;
        document.getElementById('title').value = file.title;
        document.getElementById('imageUrl').value = file.imageUrl;
        document.getElementById('type').value = file.type;
        document.getElementById('downloadUrl').value = file.downloadUrl || '';
        document.getElementById('seoKeywords').value = (file.seoKeywords || []).join(', ');
        
        priceInput.style.display = file.type === 'paid' ? 'block' : 'none';
        document.getElementById('price').value = file.price || '';
        
        document.getElementById('form-title').innerText = 'Edit PLP File';
        document.getElementById('submit-btn').innerText = 'Update File';
        window.scrollTo(0, 0);
    }
}

// --- Initial Load ---
fetchAllFiles();
