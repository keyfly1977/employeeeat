
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId + '-tab').classList.add('active');
      event.target.classList.add('active');
      if (tabId === 'admin') {
        loadSettings();
        loadHREmployees();
      }
    }

    const today = new Date();
    document.getElementById('print-date').innerText = today.toLocaleDateString('zh-TW');
    document.getElementById('export-month').value = today.toISOString().substring(0, 7);

    let currentSettings = {};

    async function loadSettings() {
      const res = await fetch('/api/settings');
      const data = await res.json();
      currentSettings = data;
      
      document.getElementById('set-bento').value = data.bento_price || 60;
      document.getElementById('set-tw').value = data.taiwanese_meal_allowance || 1800;
      document.getElementById('set-fr-0').value = data.foreign_holiday_allowance || 100;
      document.getElementById('set-fr-8').value = data.foreign_holiday_ot_8hr_allowance || 125;
      document.getElementById('set-fr-10').value = data.foreign_holiday_ot_10hr_allowance || 150;
      document.getElementById('set-tw-base').value = data.taiwanese_base_allowance || 300;
      document.getElementById('set-fr-base').value = data.foreign_base_allowance || 300;
      document.getElementById('set-ramadan-start').value = data.ramadan_start || '2026-02-18';
      document.getElementById('set-ramadan-end').value = data.ramadan_end || '2026-03-19';
    }

    let isGuardUnlocked = false;
    function checkPassword() {
        if (isGuardUnlocked) return true;
        const pwd = prompt('請輸入密碼以解鎖修改權限：');
        if (pwd === '5252') {
            isGuardUnlocked = true;
            return true;
        }
        if (pwd !== null) alert('密碼錯誤！');
        renderTable(); 
        return false;
    }

      async function updateDiet(empId, dietType) {
        if (!checkPassword()) return;
        try {
          await fetch('/api/employees/diet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empId, dietType })
          });
          loadMeals();
        } catch (error) {
          console.error('Error updating diet:', error);
        }
      }

      async function updateOptOut(empId, type, isChecked) {
        if (!checkPassword()) {
            // Revert checkbox state visually since password failed
            renderTable();
            return;
        }
        try {
          // Find the current values from the server data
          const emp = allEmployeesData.find(e => String(e.empId) === String(empId));
          if (!emp) return;
          
          if (type === 'lunch') emp.optOutLunch = isChecked;
          if (type === 'dinner') emp.optOutDinner = isChecked;
          if (type === 'holiday') emp.noHolidayAllowance = isChecked;

          // Also update today's checkbox for immediate feedback
          if (type === 'lunch' && isChecked) {
              emp.hasLunch = false;
              await fetch('/api/meals/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ empId, hasLunch: false, hasDinner: emp.hasDinner })
              });
          }
          if (type === 'dinner' && isChecked) {
              emp.hasDinner = false;
              await fetch('/api/meals/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ empId, hasLunch: emp.hasLunch, hasDinner: false })
              });
          }

          await fetch('/api/employees/optout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empId, optOutLunch: emp.optOutLunch, optOutDinner: emp.optOutDinner, noHolidayAllowance: emp.noHolidayAllowance })
          });
          
          loadMeals();
        } catch (error) {
          console.error('Error updating opt-out:', error);
        }
      }

    async function loadHREmployees() {
      try {
        const res = await fetch('/api/employees');
        const emps = await res.json();
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
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">${emp.emp_no || emp.emp_id}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); font-weight: 600;">${emp.name}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">${emp.department || '未分配'}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); text-align: center;">
              <input type="checkbox" class="hr-noacc-checkbox" data-empid="${emp.emp_id}" ${emp.no_accommodation === 1 ? 'checked' : ''} style="transform: scale(1.5); cursor: pointer; accent-color: var(--color-primary);">
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); text-align: center;">
              <input type="checkbox" class="hr-home-checkbox" data-empid="${emp.emp_id}" ${emp.is_returning_home === 1 ? 'checked' : ''} style="transform: scale(1.5); cursor: pointer; accent-color: var(--color-primary);">
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">
              <div style="display: flex; gap: 5px; align-items: center; justify-content: flex-start; ${emp.is_returning_home === 1 ? '' : 'opacity: 0.3; pointer-events: none;'}" id="home-dates-${emp.emp_id}">
                <input type="date" class="hr-date-input" data-empid="${emp.emp_id}" data-type="start" value="${emp.return_home_start || ''}" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
                <span>~</span>
                <input type="date" class="hr-date-input" data-empid="${emp.emp_id}" data-type="end" value="${emp.return_home_end || ''}" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
              </div>
            </td>
          `;
          hrTbody.appendChild(tr);
        });

        const updateAllowanceStatus = async (empId) => {
            const noAccCb = document.querySelector(`.hr-noacc-checkbox[data-empid="${empId}"]`);
            const homeCb = document.querySelector(`.hr-home-checkbox[data-empid="${empId}"]`);
            const startInput = document.querySelector(`.hr-date-input[data-empid="${empId}"][data-type="start"]`);
            const endInput = document.querySelector(`.hr-date-input[data-empid="${empId}"][data-type="end"]`);
            
            const noAcc = noAccCb ? (noAccCb.checked ? 1 : 0) : 0;
            const isHome = homeCb ? (homeCb.checked ? 1 : 0) : 0;
            const startStr = startInput ? startInput.value : '';
            const endStr = endInput ? endInput.value : '';

            const dateContainer = document.getElementById(`home-dates-${empId}`);
            if (dateContainer) {
                if (isHome) {
                    dateContainer.style.opacity = '1';
                    dateContainer.style.pointerEvents = 'auto';
                } else {
                    dateContainer.style.opacity = '0.3';
                    dateContainer.style.pointerEvents = 'none';
                }
            }

            try {
              const resp = await fetch(`/api/employees/${empId}/allowance-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    no_accommodation: noAcc,
                    is_returning_home: isHome,
                    return_home_start: startStr,
                    return_home_end: endStr
                })
              });
              if (!resp.ok) throw new Error('Update failed');
            } catch (err) {
              console.error("Failed to update status:", err);
              alert("更新失敗，請確認網路連線！");
            }
        };

        document.querySelectorAll('.hr-noacc-checkbox').forEach(cb => cb.addEventListener('change', (e) => updateAllowanceStatus(e.target.dataset.empid)));
        document.querySelectorAll('.hr-home-checkbox').forEach(cb => cb.addEventListener('change', (e) => updateAllowanceStatus(e.target.dataset.empid)));
        document.querySelectorAll('.hr-date-input').forEach(inp => inp.addEventListener('change', (e) => updateAllowanceStatus(e.target.dataset.empid)));
      } catch (err) {
        console.error("Failed to load HR employees:", err);
      }
    }

    document.getElementById('settings-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      currentSettings['bento_price'] = document.getElementById('set-bento').value;
      currentSettings['taiwanese_meal_allowance'] = document.getElementById('set-tw').value;
      currentSettings['foreign_holiday_allowance'] = document.getElementById('set-fr-0').value;
      currentSettings['foreign_holiday_ot_8hr_allowance'] = document.getElementById('set-fr-8').value;
      currentSettings['foreign_holiday_ot_10hr_allowance'] = document.getElementById('set-fr-10').value;
      currentSettings['taiwanese_base_allowance'] = document.getElementById('set-tw-base').value;
      currentSettings['foreign_base_allowance'] = document.getElementById('set-fr-base').value;
      currentSettings['ramadan_start'] = document.getElementById('set-ramadan-start').value;
      currentSettings['ramadan_end'] = document.getElementById('set-ramadan-end').value;
      
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings)
      });
      alert('設定已儲存！');
    });

    let allEmployeesData = [];
    let currentFilterStatus = 'all';

    function setFilter(status) {
      if (currentFilterStatus === status) {
        currentFilterStatus = 'all'; // toggle off
      } else {
        currentFilterStatus = status;
      }
      
      // Update styling on cards
      document.querySelectorAll('.stat-card').forEach(el => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = 'var(--glass-shadow)';
        el.style.opacity = currentFilterStatus === 'all' ? '1' : '0.4';
        el.style.border = '2px solid transparent';
      });
      
      if (currentFilterStatus !== 'all') {
        const baseStatus = currentFilterStatus.split('-')[0];
        const targetCard = document.getElementById(`card-${baseStatus}`);
        if (targetCard) {
          const colors = {
            'lunch': 'var(--color-blue)',
            'dinner': 'var(--color-orange)',
            'present': 'var(--color-green)',
            'absent': 'var(--color-red)',
            'leave': 'var(--color-orange)'
          };
          targetCard.style.transform = 'scale(1.03)';
          targetCard.style.boxShadow = `0 8px 32px rgba(0,0,0,0.2)`;
          targetCard.style.opacity = '1';
          targetCard.style.border = `2px solid ${colors[baseStatus]}`;
        }
      }
      
      renderTable();
    }

    async function loadMeals() {
      const scrollPos = window.scrollY;
      const tbody = document.getElementById('meals-tbody');
      // Show loading text only if empty to prevent flickering on updates
      if (tbody.innerHTML.trim() === '') {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--text-muted);">載入中...</td></tr>';
      }
      try {
        const res = await fetch('/api/meals/today');
        const data = await res.json();
        if (data.error) throw new Error(data.message);
        
        allEmployeesData = data.data;
        renderTable();
        window.scrollTo(0, scrollPos);
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--color-red);">載入失敗: ${err.message}</td></tr>`;
      }
    }

    function renderTable() {
        const tbody = document.getElementById('meals-tbody');
        tbody.innerHTML = '';
        
        
        // Set title with date
        const todayDateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
        document.getElementById('list-title').innerHTML = `📋 今日名單 <span style="font-size: 1rem; color: var(--text-secondary); font-weight: normal;">(${todayDateStr})</span>`;
        
        let counts = {
          lunch: { '葷食':0, '素食':0, '不吃豬':0, '不吃牛':0, '不吃羊':0, '齋戒':0 },
          dinner: { '葷食':0, '素食':0, '不吃豬':0, '不吃牛':0, '不吃羊':0, '齋戒':0 }
        };
        let lunchTotal = 0, dinnerTotal = 0, presentCount = 0, leaveCount = 0, absentCount = 0;
        
        let absentEmps = [];
        let leaveEmps = [];
        let presentEmps = [];
        let lunchEmps = [];
        let dinnerEmps = [];
        let ramadanEmps = [];
        let ramadanCount = 0;

        const queryStr = document.getElementById('guard-search') ? document.getElementById('guard-search').value.trim().toLowerCase() : '';
        const filteredData = queryStr 
            ? allEmployeesData.filter(emp => (emp.empNo || emp.empId || '').toLowerCase().includes(queryStr) || (emp.name || emp.empName || '').toLowerCase().includes(queryStr)) 
            : allEmployeesData;

        filteredData.forEach(emp => {
          let catStr = emp.dietType;
          if (catStr === '齋戒') {
            ramadanCount++;
            ramadanEmps.push(emp);
          }
          if (emp.hasLunch) {
            lunchTotal++;
            lunchEmps.push(emp);
            if (counts.lunch[catStr] !== undefined) counts.lunch[catStr]++;
            else counts.lunch['葷食']++;
          }
          if (emp.hasDinner) {
            dinnerTotal++;
            dinnerEmps.push(emp);
            if (counts.dinner[catStr] !== undefined) counts.dinner[catStr]++;
            else counts.dinner['葷食']++;
          }

          let actualStatus = emp.status; // 'present', 'leave', or 'absent'

          if (actualStatus === 'present') {
              presentCount++;
              presentEmps.push(emp);
          } else if (actualStatus === 'leave') {
              leaveCount++;
              leaveEmps.push(emp);
          } else {
              absentCount++;
              absentEmps.push(emp);
          }
        });

        const createRow = (emp) => {
          let catStr = emp.dietType;
          let catColor = 'var(--text-secondary)';
          if (catStr === '素食') catColor = 'var(--color-green)';
          else if (catStr === '不吃豬') catColor = 'var(--color-orange)';
          else if (catStr === '不吃牛') catColor = '#8b4513';
          else if (catStr === '不吃羊') catColor = '#d2691e';
          else if (catStr === '齋戒') catColor = 'var(--color-purple)';

          const tr = document.createElement('tr');
          
          let statusHtml = '';
          const formatTime = (timeStr) => timeStr ? (timeStr.includes(' ') ? timeStr.split(' ')[1].substring(0,5) : (timeStr.includes('T') ? timeStr.split('T')[1].substring(0,5) : timeStr)) : '';
          const ct = formatTime(emp.cardTime);

          if (emp.status === 'leave') {
             const reason = emp.leaveInfo.reason;
             const leaveTime = `${emp.leaveInfo.start}~${emp.leaveInfo.end}`;
             const cardText = ct ? ` (已刷卡 ${ct})` : '';
             statusHtml = `<span style="display: inline-block; padding: 4px 10px; background: rgba(255,159,10,0.15); color: var(--color-orange); border-radius: 12px; font-weight: 600; font-size: 0.85rem;">請假中 ${reason} ${leaveTime}${cardText}</span>`;
          } else if (emp.status === 'present') {
             statusHtml = `<span style="display: inline-block; padding: 4px 10px; background: rgba(48,209,88,0.15); color: var(--color-green); border-radius: 12px; font-weight: 600; font-size: 0.9rem;">已打卡 (${ct})</span>`;
          } else {
             statusHtml = `<span style="display: inline-block; padding: 4px 10px; background: rgba(255,69,58,0.15); color: var(--color-red); border-radius: 12px; font-weight: 600; font-size: 0.9rem;">未到</span>`;
          }

          tr.innerHTML = `
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">${emp.empNo}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); font-weight: 500;">
              ${emp.name}
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">${emp.nationality}</div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); color: var(--text-secondary);">${emp.deptName}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">
              <select onchange="updateDiet('${emp.empId}', this.value)" style="padding: 5px; border-radius: 5px; font-weight: bold; color: ${catColor}; border: 1px solid var(--glass-border); background: var(--glass-bg);">
                <option value="葷食" ${catStr==='葷食'?'selected':''} style="color:#333;">葷食</option>
                <option value="素食" ${catStr==='素食'?'selected':''} style="color:#333;">素食</option>
                <option value="不吃豬" ${catStr==='不吃豬'?'selected':''} style="color:#333;">不吃豬</option>
                <option value="不吃牛" ${catStr==='不吃牛'?'selected':''} style="color:#333;">不吃牛</option>
                <option value="不吃羊" ${catStr==='不吃羊'?'selected':''} style="color:#333;">不吃羊</option>
                <option value="齋戒" ${catStr==='齋戒'?'selected':''} style="color:#333;">齋戒</option>
              </select>
              <div style="margin-top: 8px; font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px;">
                <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--text-secondary);">
                  <input type="checkbox" onchange="updateOptOut('${emp.empId}', 'lunch', this.checked)" ${emp.optOutLunch ? 'checked' : ''}> 預設不訂午餐
                </label>
                <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--text-secondary);">
                  <input type="checkbox" onchange="updateOptOut('${emp.empId}', 'dinner', this.checked)" ${emp.optOutDinner ? 'checked' : ''}> 預設不訂晚餐
                </label>
                <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--text-secondary);">
                  <input type="checkbox" onchange="updateOptOut('${emp.empId}', 'holiday', this.checked)" ${emp.noHolidayAllowance ? 'checked' : ''}> 停發假日津貼
                </label>
              </div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">${statusHtml}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);"><input type="checkbox" class="toggle-checkbox" ${emp.hasLunch ? 'checked' : ''} onchange="updateMeal('${emp.empId}', this.checked, ${emp.hasDinner})"></td>
            <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);"><input type="checkbox" class="toggle-checkbox" ${emp.hasDinner ? 'checked' : ''} onchange="updateMeal('${emp.empId}', ${emp.hasLunch}, this.checked)"></td>
          `;
          return tr;
        };
        
        if (currentFilterStatus === 'all') {
            if (absentEmps.length > 0) {
                const h = document.createElement('tr');
                h.innerHTML = `<td colspan="7" style="background: rgba(255,69,58,0.08); color: var(--color-red); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">未打卡人員 (${absentEmps.length} 人)</td>`;
                tbody.appendChild(h);
                absentEmps.forEach(emp => tbody.appendChild(createRow(emp)));
            }

            if (leaveEmps.length > 0) {
                const h = document.createElement('tr');
                h.innerHTML = `<td colspan="7" style="background: rgba(255,159,10,0.08); color: var(--color-orange); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">請假中人員 (${leaveEmps.length} 人)</td>`;
                tbody.appendChild(h);
                leaveEmps.forEach(emp => tbody.appendChild(createRow(emp)));
            }
            
            if (presentEmps.length > 0) {
                const h = document.createElement('tr');
                h.innerHTML = `<td colspan="7" style="color: var(--text-secondary); padding: 20px 15px; text-align: center; font-style: italic; background: rgba(0,0,0,0.02);">💡 已隱藏 ${presentEmps.length} 名「已打卡人員」。若需查看或修改，請點擊上方綠色的「已打卡」卡片。</td>`;
                tbody.appendChild(h);
            }
        } else if (currentFilterStatus === 'absent') {
            const h = document.createElement('tr');
            h.innerHTML = `<td colspan="7" style="background: rgba(255,69,58,0.08); color: var(--color-red); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">未打卡人員 (${absentEmps.length} 人)</td>`;
            tbody.appendChild(h);
            absentEmps.forEach(emp => tbody.appendChild(createRow(emp)));
        } else if (currentFilterStatus === 'leave') {
            const h = document.createElement('tr');
            h.innerHTML = `<td colspan="7" style="background: rgba(255,159,10,0.08); color: var(--color-orange); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">請假中人員 (${leaveEmps.length} 人)</td>`;
            tbody.appendChild(h);
            leaveEmps.forEach(emp => tbody.appendChild(createRow(emp)));
        } else if (currentFilterStatus === 'present') {
            const h = document.createElement('tr');
            h.innerHTML = `<td colspan="7" style="background: rgba(48,209,88,0.08); color: var(--color-green); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">已打卡人員 (${presentEmps.length} 人)</td>`;
            tbody.appendChild(h);
            presentEmps.forEach(emp => tbody.appendChild(createRow(emp)));
        } else if (currentFilterStatus === 'lunch') {
            const h = document.createElement('tr');
            h.innerHTML = `<td colspan="7" style="background: rgba(10,132,255,0.08); color: var(--color-blue); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">今日午餐名單 (${lunchEmps.length} 人)</td>`;
            tbody.appendChild(h);
            lunchEmps.forEach(emp => tbody.appendChild(createRow(emp)));
        } else if (currentFilterStatus === 'dinner') {
            const h = document.createElement('tr');
            h.innerHTML = `<td colspan="7" style="background: rgba(255,159,10,0.08); color: var(--color-orange); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">今日晚餐名單 (${dinnerEmps.length} 人)</td>`;
            tbody.appendChild(h);
            dinnerEmps.forEach(emp => tbody.appendChild(createRow(emp)));
        } else if (currentFilterStatus.startsWith('lunch-')) {
            const diet = currentFilterStatus.split('-')[1];
            const filteredEmps = lunchEmps.filter(e => e.dietType === diet);
            const h = document.createElement('tr');
            h.innerHTML = `<td colspan="7" style="background: rgba(10,132,255,0.08); color: var(--color-blue); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">今日午餐名單 - ${diet} (${filteredEmps.length} 人)</td>`;
            tbody.appendChild(h);
            filteredEmps.forEach(emp => tbody.appendChild(createRow(emp)));
        } else if (currentFilterStatus.startsWith('dinner-')) {
            const diet = currentFilterStatus.split('-')[1];
            const filteredEmps = dinnerEmps.filter(e => e.dietType === diet);
            const h = document.createElement('tr');
            h.innerHTML = `<td colspan="7" style="background: rgba(255,159,10,0.08); color: var(--color-orange); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">今日晚餐名單 - ${diet} (${filteredEmps.length} 人)</td>`;
            tbody.appendChild(h);
            filteredEmps.forEach(emp => tbody.appendChild(createRow(emp)));
        } else if (currentFilterStatus === 'ramadan') {
            const h = document.createElement('tr');
            h.innerHTML = `<td colspan="7" style="background: rgba(175,82,222,0.08); color: var(--color-purple, #af52de); font-weight: bold; padding: 12px 15px; text-align: center; border-bottom: 1px solid var(--glass-border);">齋戒人員名單 (${ramadanEmps.length} 人)</td>`;
            tbody.appendChild(h);
            ramadanEmps.forEach(emp => tbody.appendChild(createRow(emp)));
        }

        document.getElementById('val-lunch').innerText = lunchTotal;
        document.getElementById('val-dinner').innerText = dinnerTotal;
        document.getElementById('val-present').innerText = presentCount;
        document.getElementById('val-absent').innerText = absentCount;
        document.getElementById('val-leave').innerText = leaveCount;
        if (document.getElementById('val-ramadan')) {
            document.getElementById('val-ramadan').innerText = ramadanCount;
        }

        const getLunchStyle = (filterId) => currentFilterStatus === filterId 
            ? 'cursor:pointer; background: var(--color-blue); color: white; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-decoration: none;' 
            : 'cursor:pointer; text-decoration:underline;';
        
        const getDinnerStyle = (filterId) => currentFilterStatus === filterId 
            ? 'cursor:pointer; background: var(--color-orange); color: white; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-decoration: none;' 
            : 'cursor:pointer; text-decoration:underline;';

        const ramadanStr = (currentSettings.ramadan_start && currentSettings.ramadan_end) 
            ? `<span style="font-size: 0.85rem; color: var(--color-orange); margin-left: 5px;">(齋戒設定: ${currentSettings.ramadan_start} ~ ${currentSettings.ramadan_end})</span>` 
            : '';

        document.getElementById('meal-summary').innerHTML = `
          <div style="flex:1; background: rgba(255,255,255,0.5); padding: 15px; border-radius: 8px;">
            <div style="font-size: 1.4rem; font-weight: bold; margin-bottom: 10px; color: var(--color-blue); cursor: pointer;" onclick="setFilter('lunch')">🍱 午餐總計: ${lunchTotal} 個</div>
            <div style="color: var(--text-secondary); line-height: 1.6;">
              <span style="${getLunchStyle('lunch-葷食')}" onclick="setFilter('lunch-葷食')">葷食: <strong>${counts.lunch['葷食']}</strong></span> | 
              <span style="${getLunchStyle('lunch-素食')}" onclick="setFilter('lunch-素食')">素食: <strong>${counts.lunch['素食']}</strong></span> | 
              <span style="${getLunchStyle('lunch-不吃豬')}" onclick="setFilter('lunch-不吃豬')">不吃豬: <strong>${counts.lunch['不吃豬']}</strong></span><br>
              <span style="${getLunchStyle('lunch-不吃牛')}" onclick="setFilter('lunch-不吃牛')">不吃牛: <strong>${counts.lunch['不吃牛']}</strong></span> | 
              <span style="${getLunchStyle('lunch-不吃羊')}" onclick="setFilter('lunch-不吃羊')">不吃羊: <strong>${counts.lunch['不吃羊']}</strong></span> | 
              <span style="${getLunchStyle('lunch-齋戒')}" onclick="setFilter('lunch-齋戒')">齋戒: <strong>${counts.lunch['齋戒']}</strong></span> ${ramadanStr}
            </div>
          </div>
          <div style="flex:1; background: rgba(255,255,255,0.5); padding: 15px; border-radius: 8px;">
            <div style="font-size: 1.4rem; font-weight: bold; margin-bottom: 10px; color: var(--color-orange); cursor: pointer;" onclick="setFilter('dinner')">🌙 晚餐總計: ${dinnerTotal} 個</div>
            <div style="color: var(--text-secondary); line-height: 1.6;">
              <span style="${getDinnerStyle('dinner-葷食')}" onclick="setFilter('dinner-葷食')">葷食: <strong>${counts.dinner['葷食']}</strong></span> | 
              <span style="${getDinnerStyle('dinner-素食')}" onclick="setFilter('dinner-素食')">素食: <strong>${counts.dinner['素食']}</strong></span> | 
              <span style="${getDinnerStyle('dinner-不吃豬')}" onclick="setFilter('dinner-不吃豬')">不吃豬: <strong>${counts.dinner['不吃豬']}</strong></span><br>
              <span style="${getDinnerStyle('dinner-不吃牛')}" onclick="setFilter('dinner-不吃牛')">不吃牛: <strong>${counts.dinner['不吃牛']}</strong></span> | 
              <span style="${getDinnerStyle('dinner-不吃羊')}" onclick="setFilter('dinner-不吃羊')">不吃羊: <strong>${counts.dinner['不吃羊']}</strong></span> | 
              <span style="${getDinnerStyle('dinner-齋戒')}" onclick="setFilter('dinner-齋戒')">齋戒: <strong>${counts.dinner['齋戒']}</strong></span> ${ramadanStr}
            </div>
          </div>
        `;
    }

    async function updateMeal(empId, hasLunch, hasDinner) {
      if (!checkPassword()) return;
      await fetch('/api/meals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId, hasLunch, hasDinner })
      });
      loadMeals(); 
    }

    async function previewFinance() {
      const start = document.getElementById('finance-start').value;
      const end = document.getElementById('finance-end').value;
      if (!start || !end) return alert('請選擇完整的查詢區間');

      try {
        const res = await fetch(`/api/finance/preview?start=${start}&end=${end}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const thead = document.getElementById('finance-preview-thead');
        let headerRow1 = `
          <tr style="color: var(--text-muted); font-size: 0.95rem; letter-spacing: 0.5px;">
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">工號</th>
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">姓名</th>
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border);">部門</th>`;
            
        let headerRow2 = `<tr style="color: var(--text-muted); font-size: 0.9rem; letter-spacing: 0.5px;">`;

        data.dates.forEach(d => {
            headerRow1 += `<th colspan="2" style="padding: 8px; font-weight: 600; border-bottom: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border); text-align: center;">${d.label}</th>`;
            headerRow2 += `<th style="padding: 8px; font-weight: 500; border-bottom: 2px solid var(--glass-border); text-align: center;">午</th><th style="padding: 8px; font-weight: 500; border-bottom: 2px solid var(--glass-border); border-right: 1px solid var(--glass-border); text-align: center;">晚</th>`;
        });

        headerRow1 += `
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">應扣伙食費</th>
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">應發津貼</th>
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">一般出勤</th>
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">假日(0h)</th>
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">假日(8h)</th>
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">假日(10h+)</th>
            <th rowspan="2" style="padding: 12px 15px; font-weight: 600; border-bottom: 2px solid var(--glass-border);">備註</th>
          </tr>`;
        headerRow2 += `</tr>`;
        thead.innerHTML = headerRow1 + headerRow2;

        const tbody = document.getElementById('finance-preview-tbody');
        if (data.rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${10 + data.dates.length * 2}" style="text-align:center; padding: 40px; color: var(--text-muted);">此區間無資料或全無訂餐</td></tr>`;
            return;
        }

        let html = '';
        data.rows.forEach(r => {
            html += `<tr>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border);">${r.id}</td>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border);">${r.name}</td>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border);">${r.dept}</td>`;
            
            data.dates.forEach(d => {
                const dayData = r.days[d.date] || {};
                let bg = d.isHoliday ? 'rgba(0,0,0,0.05)' : '';
                if (dayData.note === '返鄉') bg = '#fff9c4';
                else if (dayData.note === '齋戒') bg = '#e8f5e9';

                let lText = dayData.l ? 'V' : '';
                if (dayData.lText) lText = dayData.lText;
                let dText = dayData.d ? 'V' : '';
                if (dayData.dText) dText = dayData.dText;

                html += `<td style="padding: 5px; border-bottom: 1px solid var(--glass-border); background: ${bg}; text-align: center; color: #333;">${lText}</td>`;
                html += `<td style="padding: 5px; border-bottom: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border); background: ${bg}; text-align: center; color: #333;">${dText}</td>`;
            });

            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); text-align: right;">${r.deduction}</td>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); text-align: right;">${r.allowance}</td>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); text-align: right;">${r.norm}</td>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); text-align: right;">${r.h0}</td>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); text-align: right;">${r.h8}</td>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border); text-align: right;">${r.h10}</td>`;
            html += `<td style="padding: 10px; border-bottom: 1px solid var(--glass-border);">${r.note}</td>`;
            html += `</tr>`;
        });
        tbody.innerHTML = html;

      } catch (err) {
        alert('預覽失敗: ' + err.message);
      }
    }

    function exportExcel() {
      const start = document.getElementById('finance-start').value;
      const end = document.getElementById('finance-end').value;
      if (!start || !end) return alert('請選擇完整的查詢區間');
      window.location.href = `/api/export/excel?start=${start}&end=${end}`;
    }

    async function backendPrint() {
        const btn = document.querySelector('button[onclick="backendPrint()"]');
        if (!btn) return;
        
        // 預設列印時自動切換至午餐或晚餐清單
        if (typeof currentFilterStatus !== 'undefined' && currentFilterStatus === 'all') {
            const hour = new Date().getHours();
            if (hour >= 13) {
                setFilter('dinner');
            } else {
                setFilter('lunch');
            }
        }

        const oldText = btn.innerHTML;
        btn.innerHTML = '🖨️ 傳送中...';
        btn.disabled = true;

        try {
            let styles = '';
            for (let sheet of document.styleSheets) {
                try {
                    for (let rule of sheet.cssRules) {
                        styles += rule.cssText + '\\n';
                    }
                } catch(e) {}
            }

            document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.print-only').forEach(el => el.style.display = 'block');

            const mainContent = document.querySelector('.main-content').outerHTML;

            document.querySelectorAll('.no-print').forEach(el => el.style.display = '');
            document.querySelectorAll('.print-only').forEach(el => el.style.display = '');

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>今日訂餐清單</title>
                    <style>
                        ${styles}
                        body { background: white; padding: 20px; font-family: sans-serif; }
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                    </style>
                </head>
                <body>
                    ${mainContent}
                </body>
                </html>
            `;

            const res = await fetch('/api/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ htmlContent })
            });

            const data = await res.json();
            if (data.success) {
                alert('🖨️ ' + data.message);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            alert('列印失敗: ' + err.message);
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    }

    // Init
    loadSettings().then(() => {
        loadMeals();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        document.getElementById('q-start-date').value = yStr;
        document.getElementById('q-end-date').value = yStr;
    });

    async function executeQuery() {
        const qStart = document.getElementById('q-start-date').value;
        const qEnd = document.getElementById('q-end-date').value;
        const qEmpno = document.getElementById('q-empno').value.trim().toLowerCase();
        const qName = document.getElementById('q-name').value.trim().toLowerCase();
        const tbody = document.getElementById('query-tbody');

        if (!qStart || !qEnd) {
            alert("請選擇開始與結束日期！");
            return;
        }

        const sDate = new Date(qStart);
        const eDate = new Date(qEnd);
        if (eDate < sDate) {
            alert("結束日期不能早於開始日期！");
            return;
        }

        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted);">查詢中，請稍候...</td></tr>';
        
        try {
            const url = `/api/meals/today?startDate=${qStart}&endDate=${qEnd}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) throw new Error(data.message);
            
            let filtered = data.data;
            if (qEmpno) filtered = filtered.filter(e => e.empNo && e.empNo.toLowerCase().includes(qEmpno));
            if (qName) filtered = filtered.filter(e => e.name && e.name.toLowerCase().includes(qName));

            // Sort by Date, then by EmpNo
            filtered.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                if (a.empNo && b.empNo) return a.empNo.localeCompare(b.empNo);
                return 0;
            });

            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted);">查無符合條件的資料</td></tr>';
                return;
            }

            filtered.forEach(emp => {
                const tr = document.createElement('tr');
                
                let statusHtml = '';
                const formatTime = (timeStr) => timeStr ? (timeStr.includes(' ') ? timeStr.split(' ')[1].substring(0,5) : (timeStr.includes('T') ? timeStr.split('T')[1].substring(0,5) : timeStr)) : '';
                const ct = formatTime(emp.cardTime);

                if (emp.status === 'leave') {
                    const reason = emp.leaveInfo.reason;
                    statusHtml = `<span style="color: var(--color-orange); font-weight: 600; font-size: 0.85rem;">請假中 ${reason}</span>`;
                } else if (emp.status === 'present') {
                    statusHtml = `<span style="color: var(--color-green); font-weight: 600; font-size: 0.9rem;">已打卡 (${ct})</span>`;
                } else {
                    statusHtml = `<span style="color: var(--color-red); font-weight: 600; font-size: 0.9rem;">未到</span>`;
                }

                tr.innerHTML = `
                    <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); color: var(--text-secondary); font-weight: 500;">${emp.date || ''}</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">${emp.empNo}</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); font-weight: 500;">${emp.name}</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); color: var(--text-secondary);">${emp.deptName}</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); font-weight: bold;">${emp.dietType}</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--glass-border);">${statusHtml}</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); color: var(--color-blue); font-weight: bold;">${emp.hasLunch ? '✔️' : ''}</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--glass-border); color: var(--color-orange); font-weight: bold;">${emp.hasDinner ? '✔️' : ''}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--color-red);">查詢失敗: ${err.message}</td></tr>`;
        }
    }
  