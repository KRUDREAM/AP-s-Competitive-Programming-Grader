const SUPABASE_URL = 'https://hqnmfkafwwnjiqpdhzoh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxbm1ma2Fmd3duamlxcGRoem9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMTc0NzEsImV4cCI6MjEwOTc5MzQ3MX0.m6dHtNnXuQ108DvafyKWeFvAg_oySuQH3LRg0Jzaops';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_MENU_ITEMS = [
  { id: 'problems', label: 'จัดการโจทย์ทั้งหมด', icon: 'fa-book-open', href: 'admin.html' },
  { id: 'verify', label: 'ตรวจสอบโจทย์จากทางบ้าน', icon: 'fa-clipboard-check', href: 'admin-verify.html' },
  { id: 'contests', label: 'จัดการ Contest', icon: 'fa-trophy', href: 'admin-contests.html' },
  { id: 'scoreboard', label: 'Scoreboard กระดานคะแนน', icon: 'fa-ranking-star', href: 'admin-scoreboard.html' },
  { id: 'users', label: 'จัดการผู้ใช้ (Users)', icon: 'fa-users-gear', href: 'admin-users.html' },
  { id: 'stats', label: 'สถิติการทำโจทย์ & ส่งโค้ด', icon: 'fa-chart-pie', href: 'admin-stats.html' }
];

function renderAdminShell(activePageId) {
  // Inject Top Navbar with Hamburger button
  const headerContainer = document.getElementById('adminHeaderMount');
  if (headerContainer) {
    headerContainer.innerHTML = `
      <header class="sticky top-0 z-40 tech-glass border-b border-cyan-500/15 px-4 md:px-6 py-3.5 flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <button type="button" onclick="toggleAdminMobileDrawer()" class="lg:hidden tech-glass hover:bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer" title="เปิดเมนู">
            <i class="fa-solid fa-bars text-sm"></i>
          </button>
          <div class="flex items-center gap-3 cursor-pointer" onclick="window.location.href='index.html'">
            <div class="bg-gradient-to-tr from-rose-600 to-amber-500 p-2 rounded-xl shadow-lg shadow-rose-500/20 text-white font-bold text-base flex items-center justify-center w-9 h-9">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <div>
              <h1 class="font-bold text-sm tracking-widest text-rose-400 uppercase">ST8 CP-Grader</h1>
              <p class="text-[10px] text-gray-400 tracking-wider">ADMIN CONTROL PANEL</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <a href="index.html" class="tech-glass hover:bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5">
            <i class="fa-solid fa-house"></i> <span class="hidden sm:inline">หน้าหลัก</span>
          </a>
          <button type="button" onclick="handleAdminLogout()" class="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-3.5 py-2 rounded-xl text-xs transition font-semibold cursor-pointer">
            <i class="fa-solid fa-right-from-bracket mr-1"></i> ออกจากระบบ
          </button>
        </div>
      </header>
    `;
  }

  // Inject Desktop Sidebar + Mobile Slide-over Hamburger Drawer
  const sidebarContainer = document.getElementById('adminSidebarMount');
  if (sidebarContainer) {
    const navHtml = ADMIN_MENU_ITEMS.map(item => {
      const isActive = item.id === activePageId;
      const cls = isActive
        ? 'w-full text-left px-3.5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/45 text-cyan-300 text-xs font-semibold flex items-center gap-2.5 transition-all duration-200 shadow-sm shadow-cyan-500/10'
        : 'w-full text-left px-3.5 py-2.5 rounded-xl text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent text-xs font-medium flex items-center gap-2.5 transition-all duration-200';
      return `
        <a href="${item.href}" class="${cls}">
          <i class="fa-solid ${item.icon} w-4 text-center ${isActive ? 'text-cyan-400' : 'text-gray-400'}"></i>
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    sidebarContainer.innerHTML = `
      <!-- Mobile Backdrop -->
      <div id="adminMobileDrawerBackdrop" onclick="toggleAdminMobileDrawer(false)" class="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm hidden lg:hidden"></div>

      <!-- Sidebar / Drawer -->
      <aside id="adminSidebarDrawer" class="fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-60 shrink-0 tech-glass border-r border-cyan-500/20 p-4 space-y-3 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-out lg:min-h-[calc(100vh-69px)]">
        <div class="flex items-center justify-between text-cyan-300 font-bold text-xs tracking-wider uppercase px-2 pb-2.5 border-b border-cyan-500/20">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-bars text-cyan-400"></i>
            <span>เมนูผู้ดูแลระบบ</span>
          </div>
          <button type="button" onclick="toggleAdminMobileDrawer(false)" class="lg:hidden text-gray-400 hover:text-white w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <nav class="flex flex-col gap-1.5">
          ${navHtml}
        </nav>
      </aside>
    `;
  }
}

function toggleAdminMobileDrawer(forceState = null) {
  const drawer = document.getElementById('adminSidebarDrawer');
  const backdrop = document.getElementById('adminMobileDrawerBackdrop');
  if (!drawer || !backdrop) return;

  const isClosed = drawer.classList.contains('-translate-x-full');
  const shouldOpen = forceState !== null ? forceState : isClosed;

  if (shouldOpen) {
    drawer.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  } else {
    drawer.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }
}

function showToast(title, desc, isError = false) {
  const toast = document.getElementById('systemToast');
  if (!toast) return;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent = desc;
  const icon = document.getElementById('toastIcon');
  icon.className = isError ? 'fa-solid fa-circle-exclamation text-rose-400 text-lg' : 'fa-solid fa-circle-check text-cyan-400 text-lg';

  toast.classList.remove('translate-x-[120%]');
  setTimeout(() => { toast.classList.add('translate-x-[120%]'); }, 3200);
}

async function ensureAdminSession(onReadyCallback) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    showToast('แจ้งเตือน', 'กรุณาเข้าสู่ระบบแอดมินก่อน', true);
    setTimeout(() => { window.location.href = 'index.html'; }, 1400);
    return null;
  }
  if (typeof onReadyCallback === 'function') {
    onReadyCallback(session);
  }
  return session;
}

function handleAdminLogout() {
  supabaseClient.auth.signOut().then(() => { window.location.href = 'index.html'; });
}
