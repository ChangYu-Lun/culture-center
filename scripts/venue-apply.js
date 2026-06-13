/* =============================================================================
 * venue-apply.js — 場地申請流程（4 步驟）
 *   Step 0：借閱須知與服務條款（同意 → 解鎖下一步）
 *   Step 1：申請資訊（申請人 / 團體 / 聯絡方式）
 *   Step 2：活動資訊（名稱 / 類型 / 人數 / 餐飲）
 *   Step 3：申請完成（摘要 + 操作按鈕）
 * ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  let currentStep = 0;                    // 0=terms, 1=申請資訊, 2=活動資訊, 3=完成
  let attendees = 10;                     // 預計參加人數

  /* ---- 元素取用 ------------------------------------------------------- */
  const panels    = [0,1,2,3].map(i => document.getElementById(`step-${i}`));
  const stepper   = document.getElementById('apply-stepper');
  const subtitle  = document.getElementById('apply-subtitle');
  const stepDots  = [...document.querySelectorAll('.apply-step')];
  const lines     = [...document.querySelectorAll('.apply-step-line')];

  /* ---- 步驟切換 ------------------------------------------------------- */
  const showStep = (n) => {
    currentStep = n;
    panels.forEach((p, i) => p.classList.toggle('hidden', i !== n));

    // 步驟條：step 1+ 才顯示
    const showStepper = n >= 1;
    stepper.classList.toggle('hidden', !showStepper);
    subtitle.classList.toggle('hidden', !showStepper);

    if (showStepper) {
      stepDots.forEach((dot, i) => {
        const num = i + 1;          // dots are 1-indexed
        const circle = dot.querySelector('.apply-step-circle');
        const isDone = num < n;
        const isActive = num === n;
        circle.classList.toggle('is-active', isActive);
        circle.classList.toggle('is-done', isDone);
      });
      // progress lines: fill up to (n-1) steps
      lines.forEach((l, i) => l.classList.toggle('is-filled', i < n - 1));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---- Step 0：條款同意 ---------------------------------------------- */
  const agreeCb   = document.getElementById('agree-terms');
  const agreeHint = document.getElementById('agree-hint');
  const btn0      = document.getElementById('btn-step0');

  btn0.addEventListener('click', () => {
    if (!agreeCb.checked) {
      agreeHint.classList.add('text-error');
      agreeHint.textContent = '請先勾選同意條款才能繼續';
      agreeCb.focus();
      return;
    }
    showStep(1);
  });
  agreeCb.addEventListener('change', () => {
    if (agreeCb.checked) {
      agreeHint.classList.remove('text-error');
      agreeHint.textContent = '';
    }
  });

  /* ---- Step 1：申請資訊 ---------------------------------------------- */
  const s1Fields = ['f-org', 'f-name', 'f-title', 'f-phone', 'f-email'].map(id => document.getElementById(id));

  const validateStep1 = () => s1Fields.every(f => f.value.trim() !== '');

  document.getElementById('btn-step1').addEventListener('click', () => {
    if (!validateStep1()) {
      s1Fields.forEach(f => {
        if (!f.value.trim()) f.classList.add('input-error');
      });
      return;
    }
    showStep(2);
  });
  document.getElementById('btn-step1-back').addEventListener('click', () => showStep(0));
  s1Fields.forEach(f => f.addEventListener('input', () => f.classList.remove('input-error')));

  /* ---- Step 2：活動資訊 ---------------------------------------------- */
  const evName    = document.getElementById('f-ev-name');
  const evDesc    = document.getElementById('f-ev-desc');
  const descCount = document.getElementById('desc-count');
  const evPhone   = document.getElementById('f-ev-phone');
  const evEmail   = document.getElementById('f-ev-email');
  const foodAlert = document.getElementById('food-alert');
  const peopleVal = document.getElementById('f-people-val');

  // 字數計數
  evDesc.addEventListener('input', () => {
    descCount.textContent = `${evDesc.value.length} / 150`;
  });

  // 人數 +/-
  document.getElementById('people-plus').addEventListener('click', () => {
    if (attendees < 200) { attendees++; peopleVal.textContent = attendees; }
  });
  document.getElementById('people-minus').addEventListener('click', () => {
    if (attendees > 1) { attendees--; peopleVal.textContent = attendees; }
  });

  // 餐飲提示
  document.querySelectorAll('input[name="ev-food"]').forEach(r => {
    r.addEventListener('change', () => {
      const needsFood = ['茶點','用餐','外燴','其他'].includes(r.value);
      foodAlert.hidden = !needsFood || !r.checked;
    });
  });

  const validateStep2 = () => {
    const typeChecked = !!document.querySelector('input[name="ev-type"]:checked');
    const foodChecked = !!document.querySelector('input[name="ev-food"]:checked');
    return evName.value.trim() && evDesc.value.trim() && typeChecked
      && attendees > 0 && evPhone.value.trim() && evEmail.value.trim() && foodChecked;
  };

  document.getElementById('btn-step2').addEventListener('click', () => {
    if (!validateStep2()) {
      if (!evName.value.trim()) evName.classList.add('input-error');
      if (!evDesc.value.trim()) evDesc.classList.add('textarea-error');
      return;
    }
    // 生成申請編號（示範用）
    const d = new Date();
    const code = `#BR-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*999)+1).padStart(3,'0')}`;
    document.getElementById('s-code').textContent = code;
    showStep(3);
  });
  document.getElementById('btn-step2-back').addEventListener('click', () => showStep(1));

  evName.addEventListener('input', () => evName.classList.remove('input-error'));
  evDesc.addEventListener('input', () => evDesc.classList.remove('textarea-error'));

  /* ---- 初始狀態 ------------------------------------------------------- */
  showStep(0);
});
