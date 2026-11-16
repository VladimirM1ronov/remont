// Калькулятор стоимости: площадь × цена за м² × коэффициент дома; фото меняется под вид ремонта.
document.querySelectorAll('[data-calc]').forEach((root) => {
  const area = root.querySelector('[data-calc-area]');
  const sum = root.querySelector('[data-calc-sum]');
  const term = root.querySelector('[data-calc-term]');
  const pics = [...root.querySelectorAll('[data-calc-pic]')];
  const fmt = (n) => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const update = () => {
    const a = parseFloat(String(area.value).replace(',', '.').replace(/[^\d.]/g, '')) || 0;
    const type = root.querySelector('input[name$="-c-type"]:checked');
    const house = root.querySelector('input[name$="-c-house"]:checked');
    if (!type || !house) return;
    const total = Math.round((a * Number(type.value) * Number(house.value)) / 100) * 100;
    sum.textContent = a > 0 ? `от ${fmt(total)} ₽` : 'Укажите площадь';
    term.textContent = `Срок: ${type.dataset.term}`;
    pics.forEach((p) => { p.hidden = p.dataset.calcPic !== type.dataset.pic; });
  };
  root.addEventListener('input', update);
  root.addEventListener('change', update);
  update();
});
