// State variables
let employees = [];
let departments = [];
let currentStatusFilter = 'all';
let currentDeptFilter = 'all';
let searchQuery = '';
let autoRefreshTimeout = null;

// DOM Elements
const tbody = document.getElementById('employee-list-tbody');
const selectDept = document.getElementById('select-dept');
const inputSearch = document.getElementById('input-search');
const btnRefresh = document.getElementById('btn-refresh');
const statusLabel = document.getElementById('status-label');
const statusIndicator = document.getElementById('connection-status');
const updateTimer = document.getElementById('update-timer');
const mockBanner = document.getElementById('mock-banner');
const errorBanner = document.getElementById('error-banner');
const errorMessage = document.getElementById('error-message');

// Stats Elements
const valTotal = document.getElementById('val-total');
const valPresent = document.getElementById('val-present');
const valLeave = document.getElementById('val-leave');
const valAbsent = document.getElementById('val-absent');
const valMale = document.getElementById('val-male');
const valFemale = document.getElementById('val-female');

// Meal Elements removed

// Initialize
function init() {
  // Event listeners
  inputSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    updateDisplay();
  });

  selectDept.addEventListener('change', (e) => {
    currentDeptFilter = e.target.value;
    updateDisplay();
  });

  // Status Segmented Control Tabs
  const tabs = document.querySelectorAll('.segmented-control button');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentStatusFilter = e.target.getAttribute('data-status');
      updateDisplay();
    });
  });

  btnRefresh.addEventListener('click', () => {
    // Add rotate animation class temporarily
    btnRefresh.style.pointerEvents = 'none';
    fetchData(true).finally(() => {
      btnRefresh.style.pointerEvents = 'auto';
    });
  });


  // Initial Fetch
  fetchData();
  
  // Load HR Employees
  loadHREmployees();

  // Schedule daily auto-refresh at 8:35 AM
  scheduleDailyRefresh();
}

// Schedule daily refresh at 08:35 AM
function scheduleDailyRefresh() {
  const now = new Date();
  const target = new Date();
  target.setHours(8, 35, 0, 0);

  // If 8:35 AM has already passed today, schedule for tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();
  
  if (autoRefreshTimeout) {
    clearTimeout(autoRefreshTimeout);
  }

  autoRefreshTimeout = setTimeout(() => {
    // Force refresh to bypass backend cache
    fetchData(true).finally(() => {
      scheduleDailyRefresh();
    });
  }, delay);

  // Log scheduled update to console
  console.log(`[Timer] 已排程下一次自動更新時間：${target.toLocaleString()}，距離現在還有 ${Math.round(delay / 1000 / 60)} 分鐘。`);
}

// Fetch attendance data from our backend
async function fetchData(forceRefresh = false) {
  try {
    const url = `/api/attendance/today${forceRefresh ? '?refresh=true' : ''}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || errData.message || '資料讀取錯誤');
    }

    const resData = await res.json();
    employees = (resData.data || []).map(emp => {
      const savedDiet = localStorage.getItem(`diet_${emp.empNo || emp.empId}`);
      if (savedDiet) {
        emp.isVegetarian = (savedDiet === 'vegetarian');
        emp.isNoPork = (savedDiet === 'no-pork');
      }
      return emp;
    });

    // Hide error banner if it was visible
    errorBanner.classList.add('hidden');

    // Connection Mode UI
    const dot = statusIndicator.querySelector('.pulse-dot');
    if (resData.mock) {
      // Mock mode
      mockBanner.classList.remove('hidden');
      dot.className = 'pulse-dot yellow';
      statusLabel.textContent = '模擬測試數據';

      const bannerSpan = mockBanner.querySelector('span');
      if (bannerSpan) {
        if (resData.error) {
          bannerSpan.innerHTML = `<strong>⚠️ 串接 HR API 失敗 (等待開通 /api/ed/emp 權限)：</strong>${resData.message}。目前已自動降級使用模擬數據，供您與警衛繼續進行測試。`;
        } else {
          bannerSpan.innerHTML = `<strong>模擬測試模式：</strong>目前使用模擬出勤資料。若要連接公司真實的 HR 系統，請在伺服器的 <code>config.json</code> 填入您的 API 登入資料。`;
        }
      }
    } else {
      // Real mode
      mockBanner.classList.add('hidden');
      dot.className = 'pulse-dot green';
      statusLabel.textContent = '真實數據連線';
    }

    // Update last update timestamp
    const now = new Date();
    updateTimer.textContent = `最後更新: ${now.toTimeString().split(' ')[0]}`;

    // Populate department list dropdown
    populateDepartments();

    // Redraw and recalculate
    updateDisplay();

  } catch (error) {
    console.error("Fetch failed:", error);

    // Show error banner
    errorBanner.classList.remove('hidden');
    errorMessage.innerHTML = `<strong>讀取失敗:</strong> ${error.message}`;

    // Set indicator to red
    const dot = statusIndicator.querySelector('.pulse-dot');
    dot.className = 'pulse-dot red';
    statusLabel.textContent = '連線異常';
  }
}

// Compile departments list dynamically from data
function populateDepartments() {
  const depts = new Set(employees.map(emp => emp.deptName).filter(Boolean));
  departments = Array.from(depts).sort();

  // Keep select element value
  const currentValue = selectDept.value;

  // Clear select options except the first one
  selectDept.innerHTML = '<option value="all">所有部門</option>';

  departments.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept;
    option.textContent = dept;
    selectDept.appendChild(option);
  });

  // Restore value if it still exists
  if (departments.includes(currentValue)) {
    selectDept.value = currentValue;
    currentDeptFilter = currentValue;
  } else {
    selectDept.value = 'all';
    currentDeptFilter = 'all';
  }
}

// Filter and render the list
function updateDisplay() {
  // 1. Filter
  const filtered = employees.filter(emp => {
    // Search query match
    const searchMatch = !searchQuery ||
      emp.name.toLowerCase().includes(searchQuery) ||
      (emp.empNo && emp.empNo.toLowerCase().includes(searchQuery)) ||
      (emp.empId && String(emp.empId).includes(searchQuery));

    // Department match
    const deptMatch = currentDeptFilter === 'all' || emp.deptName === currentDeptFilter;

    // Status match: 'all' filter shows only 'absent' and 'leave' (pending action items)
    let statusMatch = false;
    if (currentStatusFilter === 'all') {
      statusMatch = emp.status === 'absent' || emp.status === 'leave';
    } else {
      statusMatch = emp.status === currentStatusFilter;
    }

    return searchMatch && deptMatch && statusMatch;
  });

  // 2. Render list
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="no-data-cell">沒有符合篩選條件的員工資料。</td>
      </tr>
    `;
  } else {
    const absents = filtered.filter(emp => emp.status === 'absent');
    const leaves = filtered.filter(emp => emp.status === 'leave');
    const presents = filtered.filter(emp => emp.status === 'present');

    const renderEmpRow = (emp) => {
      const tr = document.createElement('tr');

      // Status Badge
      let statusBadge = '';
      let detailText = '';

      if (emp.status === 'present') {
        statusBadge = '<span class="badge badge-present"><span class="pulse-dot green" style="animation:none; width:6px; height:6px;"></span>已打卡</span>';
        if (emp.cardTime) {
          const time = new Date(emp.cardTime);
          const hh = String(time.getHours()).padStart(2, '0');
          const mm = String(time.getMinutes()).padStart(2, '0');
          detailText = `<span class="time-text">${hh}:${mm} 打卡</span>`;
        } else {
          detailText = '<span class="time-text">已到 (打卡時間未載入)</span>';
        }
      } else if (emp.status === 'leave') {
        statusBadge = `<span class="badge badge-leave">請假中</span>`;
        detailText = `<span class="leave-text">${emp.leaveReason || '今日請假'}</span>`;
      } else {
        statusBadge = '<span class="badge badge-absent"><span class="pulse-dot red" style="width:6px; height:6px;"></span>未打卡</span>';
        detailText = '<span class="text-muted">尚未有刷卡紀錄</span>';
      }

      tr.innerHTML = `
        <td>${emp.empNo || emp.empId}</td>
        <td style="font-weight:600; color:var(--text-primary);">${emp.name}</td>
        <td>${emp.deptName || '未分配'}</td>
        <td>${statusBadge}</td>
        <td>${detailText}</td>
      `;

      tbody.appendChild(tr);
    };

    if (currentStatusFilter === 'all') {
      if (absents.length > 0) {
        const headerTr = document.createElement('tr');
        headerTr.innerHTML = `<td colspan="5" style="background: rgba(239, 68, 68, 0.08); color: #b91c1c; font-weight: bold; font-size: 0.95rem; text-align: left; padding: 0.8rem 1.2rem; border-left: 4px solid var(--color-red);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline; vertical-align:middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ⚠️ 未打卡人員 (${absents.length} 人)</td>`;
        tbody.appendChild(headerTr);
        absents.forEach(renderEmpRow);
      }

      if (leaves.length > 0) {
        const headerTr = document.createElement('tr');
        headerTr.innerHTML = `<td colspan="5" style="background: rgba(245, 158, 11, 0.08); color: #c2410c; font-weight: bold; font-size: 0.95rem; text-align: left; padding: 0.8rem 1.2rem; border-left: 4px solid var(--color-orange);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline; vertical-align:middle; margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 📅 請假人員 (${leaves.length} 人)</td>`;
        tbody.appendChild(headerTr);
        leaves.forEach(renderEmpRow);
      }
    } else if (currentStatusFilter === 'leave') {
      if (leaves.length > 0) {
        const headerTr = document.createElement('tr');
        headerTr.innerHTML = `<td colspan="5" style="background: rgba(245, 158, 11, 0.08); color: #c2410c; font-weight: bold; font-size: 0.95rem; text-align: left; padding: 0.8rem 1.2rem; border-left: 4px solid var(--color-orange);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline; vertical-align:middle; margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 📅 請假人員 (${leaves.length} 人)</td>`;
        tbody.appendChild(headerTr);
        leaves.forEach(renderEmpRow);
      }
    } else if (currentStatusFilter === 'absent') {
      if (absents.length > 0) {
        const headerTr = document.createElement('tr');
        headerTr.innerHTML = `<td colspan="5" style="background: rgba(239, 68, 68, 0.08); color: #b91c1c; font-weight: bold; font-size: 0.95rem; text-align: left; padding: 0.8rem 1.2rem; border-left: 4px solid var(--color-red);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline; vertical-align:middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ⚠️ 未打卡人員 (${absents.length} 人)</td>`;
        tbody.appendChild(headerTr);
        absents.forEach(renderEmpRow);
      }
    } else {
      filtered.forEach(renderEmpRow);
    }
  }

  // 3. Recalculate stats and meal calculations
  calculateStatistics();
}

// Calculate Statistics
function calculateStatistics() {
  const total = employees.length;
  const present = employees.filter(emp => emp.status === 'present').length;
  const leave = employees.filter(emp => emp.status === 'leave').length;
  const absent = employees.filter(emp => emp.status === 'absent').length;
  
  const male = employees.filter(emp => emp.gender == 1).length;
  const female = employees.filter(emp => emp.gender == 2).length;

  // Update Stats Cards
  if (valTotal) valTotal.textContent = total;
  if (valPresent) valPresent.textContent = present;
  if (valLeave) valLeave.textContent = leave;
  if (valAbsent) valAbsent.textContent = absent;
  if (valMale) valMale.textContent = male;
  if (valFemale) valFemale.textContent = female;
}


// Load Foreign Employees for HR Admin Tab
async function loadHREmployees() {
  try {
    const res = await fetch('/api/employees');
    const emps = await res.json();
    
    // Filter for foreign employees (is_foreign = 1)
    const foreignEmps = emps.filter(e => e.is_foreign === 1);
    
    const hrTbody = document.getElementById('employee-hr-tbody');
    if (!hrTbody) return;
    
    hrTbody.innerHTML = '';
    
    if (foreignEmps.length === 0) {
      hrTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 40px; color: var(--text-muted);">無外籍員工資料</td></tr>';
      return;
    }
    
    foreignEmps.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">${emp.emp_id}</td>
        <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); font-weight: 600;">${emp.name}</td>
        <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">${emp.department || '未分配'}</td>
        <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); text-align: center;">
          <input type="checkbox" class="hr-holiday-checkbox" data-empid="${emp.emp_id}" ${emp.no_holiday_allowance === 1 ? 'checked' : ''} style="transform: scale(1.5); cursor: pointer; accent-color: var(--color-primary);">
        </td>
      `;
      hrTbody.appendChild(tr);
    });
    
    document.querySelectorAll('.hr-holiday-checkbox').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        const empId = e.target.dataset.empid;
        const noHoliday = e.target.checked ? 1 : 0;
        try {
          const resp = await fetch(`/api/employees/${empId}/holiday-allowance`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ no_holiday_allowance: noHoliday })
          });
          if (!resp.ok) throw new Error('Update failed');
        } catch (err) {
          console.error("Failed to update holiday allowance:", err);
          alert("更新失敗，請確認網路連線！");
          // Revert checkbox
          e.target.checked = !e.target.checked;
        }
      });
    });
    
  } catch (err) {
    console.error("Failed to load HR employees:", err);
  }
}

// Run init on load
document.addEventListener('DOMContentLoaded', init);
