//---------- STICKY HEADER ----------
window.onscroll = function() {myFunction()};

// ---------- CONFIG ----------
const imageBasePath = "images/"; // Establish base path for image

// ---------- RENDER PRODUCTS ----------
document.addEventListener('DOMContentLoaded', () => {
    fetch('inventory.json')
        .then(res => res.json())
        .then(data => renderProducts(data))
        .catch(err => console.error('Error fetching data:', err));

    // Insert last updated text
    const updatedEl = document.getElementById("lastUpdated");
    const lastUpdated = new Date(document.lastModified); 
    updatedEl.textContent = "Last Updated: " +
        String(lastUpdated.getMonth() + 1).padStart(2, "0") + "/" +
        String(lastUpdated.getDate()).padStart(2, "0") + "/" +
        lastUpdated.getFullYear();

    // Back to top
    const backBtn = document.getElementById("backToTop");
    backBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

function renderProducts(products) {
  const container = document.getElementById('productContainer');
  container.innerHTML = ""; 

  // Ensure .row class is applied for your 4-column layout
  container.classList.add('row');

  products.forEach((product, idx) => {
    // Create a column
    const col = document.createElement('div');
    col.className = 'column';

    // Create a card
    const card = document.createElement('div');
    card.className = 'productCard';

    // Hero image link
    const heroSrc = (product.images && product.images.length) ? imageBasePath + product.filepath + '/' + product.images[0] : '';
    
    // Create media div to store product content
    const media = document.createElement('div');
    media.className = 'productMedia';
    
    // Create hero image
    const hero = document.createElement('img');
    hero.className = 'hero';
    hero.src = heroSrc;
    hero.alt = `${product.name} — image 1`;
    media.appendChild(hero); // Make the "media" box the current hero image

    // Open modal on hero click
    media.addEventListener('click', () => openModal(product, 0));

    // Product card body
    const body = document.createElement('div');
    body.className = 'productBody';

    // Product card name
    const title = document.createElement('h2');
    title.className = 'productTitle';
    title.textContent = product.name;

    // Product card information
    const meta = document.createElement('div');
    meta.className = 'productMeta';
    if (product.description && product.description.trim() !== "") {
        const desc = document.createElement('p');
        desc.className = 'product-description';
        desc.innerHTML = `<strong>Description:</strong> ${product.description}`;
        meta.appendChild(desc);
      }
      
      const qty = document.createElement('p');
      qty.innerHTML = `<strong>Quantity:</strong> ${product.quantity}`;
      meta.appendChild(qty);
      
      const price = document.createElement('p');
      price.innerHTML = `<strong>Price:</strong> $${product.price}`;
      //meta.appendChild(price);

    const thumbs = document.createElement('div');
    thumbs.className = 'thumbs';

    // For each image in the 
    (product.images || []).forEach((file, i) => {
        // Create  thumbnail images and links
        const t = document.createElement('img'); 
        t.src = imageBasePath + product.filepath + '/' + file;
        t.alt = `${product.name} — thumbnail ${i + 1}`;
        if (i === 0) t.classList.add('active'); // Currently selected thumbnail image

        t.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't open modal when clicking thumbnail images
            hero.src = imageBasePath + product.filepath + '/' + file;
            hero.alt = `${product.name} — image ${i + 1}`;
            // When a thumbnail image is selected, make it the hero image
            thumbs.querySelectorAll('img').forEach(img => img.classList.remove('active'));
            t.classList.add('active');
        });
        thumbs.appendChild(t);
    });

    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(media);
    card.appendChild(thumbs);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}

// ---------- MODAL / LIGHTBOX ----------
const $modal = document.getElementById('modal');
const $modalImg = document.getElementById('modalImg');
const $modalThumbs = document.getElementById('modalThumbs');
const $modalTitle = document.getElementById('modalTitle');
const $prev = document.getElementById('prevBtn');
const $next = document.getElementById('nextBtn');
const $close = document.getElementById('modalClose');

let modalState = { open: false, product: null, index: 0 };

function openModal(product, startIndex = 0) {
  if (!product || !product.images || product.images.length === 0) return;

  modalState = { open: true, product, index: startIndex };
  $modal.classList.add('open');
  $modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  buildModal(product);
  showModalImage();
}

function closeModal() {
  modalState.open = false;
  $modal.classList.remove('open');
  $modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function buildModal(product) {
  $modalThumbs.innerHTML = '';
  (product.images || []).forEach((file, i) => {
    const t = document.createElement('img');
    t.src = imageBasePath + product.filepath + '/' + file;
    t.alt = `${product.name} — image ${i + 1}`;
    t.addEventListener('click', () => { modalState.index = i; showModalImage(); });
    $modalThumbs.appendChild(t);
  });
  updateModalTitle()
  highlightModalThumb();
}

function updateModalTitle() {
  const { product, index } = modalState;
  $modalTitle.textContent = product.name;
}

function highlightModalThumb() {
  const { index } = modalState;
  [...$modalThumbs.children].forEach((el, i) => el.classList.toggle('active', i === index));
}

function showModalImage() {
  const { product, index } = modalState;
  const file = product.images[index];
  $modalImg.src = imageBasePath + product.filepath + '/' + file;
  $modalImg.alt = `${product.name} — image ${index + 1}`;
  updateModalTitle();
  highlightModalThumb();
}

function stepModal(delta) {
  const { product } = modalState;
  const len = product.images.length;
  modalState.index = (modalState.index + delta + len) % len;
  showModalImage();
}

// Controls
$prev.addEventListener('click', () => stepModal(-1));
$next.addEventListener('click', () => stepModal(1));
$close.addEventListener('click', closeModal);
$modal.addEventListener('click', (e) => { if (e.target === $modal) closeModal(); });

// Keyboard
window.addEventListener('keydown', (e) => {
  if (!modalState.open) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight') stepModal(1);
  if (e.key === 'ArrowLeft') stepModal(-1);
});

// ---------- OPTIONAL: Remove JS-driven sticky (you already use CSS sticky) ----------
// If you keep the JS sticky-from-before, it won't break this, but you can simplify by removing it.
// window.onscroll = null;

  



