/**
   ==========================================================================
   UI & HELPER FUNCTIONS
   ==========================================================================
*/

function showToast(message, isError = false) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (isError) {
    toast.style.borderColor = 'var(--color-white)';
  }

  toast.innerHTML = `
    <span>${isError ? '✕' : '✓'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabLoginBtn.classList.remove('active');
    tabRegisterBtn.classList.add('active');
  }
}

function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function openNewTicketModal() {
  document.getElementById('newTicketModal').classList.add('active');
}

function closeNewTicketModal() {
  document.getElementById('newTicketModal').classList.remove('active');
  document.getElementById('newTicketForm').reset();
}

function closeDetailModal() {
  document.getElementById('ticketDetailModal').classList.remove('active');
}
