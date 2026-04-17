window.Filter = (() => {
  let activeFilters = { type: 'All' };

  function init() {
    const chips = document.querySelectorAll('.chip[data-filter]');
    if (!chips.length) return;

    chips.forEach(chip => {
      chip.addEventListener('click', async () => {
        const key   = chip.dataset.filter;
        const value = chip.dataset.value;

        // Update active chip UI
        document.querySelectorAll(`.chip[data-filter="${key}"]`).forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        activeFilters[key] = value;
        await window.Swipe.reloadWithFilter(activeFilters);
      });
    });

    // Activate "All" by default
    document.querySelector('.chip[data-filter="type"][data-value="All"]')?.classList.add('active');
  }

  return { init, getActive: () => activeFilters };
})();
