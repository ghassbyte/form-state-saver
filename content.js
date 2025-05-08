document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  const pageKey = window.location.origin + window.location.pathname;

  function getUniqueSelector(el, baseSelector) {
    if (el.name) return `[name="${el.name}"]`;
    const sameTypeEls = Array.from(form.querySelectorAll(baseSelector));
    const index = sameTypeEls.indexOf(el);
    return `${baseSelector}:nth-of-type(${index + 1})`;
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveProfile") {
      const profileKey = `${pageKey}::${request.profileName}`;
      const profile = {
        radios: [],
        dropdowns: [],
        textboxes: [],
        textareas: []
      };

      // Save checked radios
      form.querySelectorAll('input[type="radio"]').forEach((radio) => {
        if (radio.checked) {
          profile.radios.push({ name: radio.name, value: radio.value });
        }
      });

      // Save dropdowns
      form.querySelectorAll('select').forEach((select) => {
        profile.dropdowns.push({ name: select.name, value: select.value });
      });

      // Save textboxes (excluding type="date" or date selectors)
      form.querySelectorAll('input[type="text"]').forEach((textbox) => {
        const isDateField = textbox.placeholder?.toLowerCase().includes('dd/mm/yyyy') ||
                            textbox.className?.includes('limitDate');
        if (!isDateField) {
          profile.textboxes.push({
            selector: getUniqueSelector(textbox, 'input[type="text"]'),
            value: textbox.value
          });
        }
      });

      // Save user-filled <textarea> only
      form.querySelectorAll('textarea').forEach((textarea) => {
        // Exclude hidden/invisible or date-related textareas (if any exist)
        const isDateLike = textarea.placeholder?.toLowerCase().includes('dd/mm/yyyy');
        if (!isDateLike) {
          profile.textareas.push({
            selector: getUniqueSelector(textarea, 'textarea'),
            value: textarea.value
          });
        }
      });

      chrome.storage.local.set({ [profileKey]: profile }, () => {
        sendResponse({ success: !chrome.runtime.lastError });
      });

      return true; // Keep message channel open
    }

    if (request.action === "loadProfile") {
      const profileKey = `${pageKey}::${request.profileName}`;
      chrome.storage.local.get(profileKey, (data) => {
        const profile = data[profileKey];
        if (profile) {
          // Clear all existing inputs
          form.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
          form.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
          form.querySelectorAll('input[type="text"]').forEach(t => {
            const isDateField = t.placeholder?.toLowerCase().includes('dd/mm/yyyy') ||
                                t.className?.includes('limitDate');
            if (!isDateField) t.value = "";
          });
          form.querySelectorAll('textarea').forEach(t => {
            const isDateLike = t.placeholder?.toLowerCase().includes('dd/mm/yyyy');
            if (!isDateLike) t.value = "";
          });

          // Load saved data
          profile.radios?.forEach(({ name, value }) => {
            const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });

          profile.dropdowns?.forEach(({ name, value }) => {
            const select = form.querySelector(`select[name="${name}"]`);
            if (select) {
              select.value = value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });

          profile.textboxes?.forEach(({ selector, value }) => {
            const textbox = form.querySelector(selector);
            if (textbox) {
              textbox.value = value;
              textbox.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });

          profile.textareas?.forEach(({ selector, value }) => {
            const textarea = form.querySelector(selector);
            if (textarea) {
              textarea.value = value;
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });

          sendResponse({ success: true });
        } else {
          sendResponse({ success: false });
        }
      });

      return true;
    }
  });
});
