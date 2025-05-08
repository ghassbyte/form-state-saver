document.addEventListener('DOMContentLoaded', () => {
  const profileNameInput = document.getElementById('profileName');
  const saveProfileButton = document.getElementById('saveProfile');
  const loadProfileButton = document.getElementById('loadProfile');
  const deleteProfileButton = document.getElementById('deleteProfile');
  const profileList = document.getElementById('profileList');

  function updateProfileList() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const pageKey = new URL(tabs[0].url).origin + new URL(tabs[0].url).pathname;

      chrome.storage.local.get(null, (data) => {
        profileList.innerHTML = "";
        Object.keys(data).forEach((key) => {
          if (key.startsWith(pageKey + "::")) {
            const profileName = key.split("::")[1];
            const option = document.createElement("option");
            option.value = profileName;
            option.textContent = profileName;
            profileList.appendChild(option);
          }
        });
      });
    });
  }

  saveProfileButton.addEventListener('click', () => {
    const profileName = profileNameInput.value.trim();
    if (!profileName) return alert("Enter a profile name.");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;

      chrome.tabs.sendMessage(tabs[0].id, { action: "saveProfile", profileName }, (response) => {
        if (response?.success) {
          alert("Profile saved!");
          updateProfileList(); // Refresh list after saving
        } else {
          alert("Failed to save profile.");
        }
      });
    });
  });

  loadProfileButton.addEventListener('click', () => {
    const selectedProfile = profileList.value;
    if (!selectedProfile) return alert("Select a profile to load.");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;

      chrome.tabs.sendMessage(tabs[0].id, { action: "loadProfile", profileName: selectedProfile }, (response) => {
        if (response?.success) alert("Profile loaded!");
      });
    });
  });

  deleteProfileButton.addEventListener('click', () => {
    const selectedProfile = profileList.value;
    if (!selectedProfile) return alert("Select a profile to delete.");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const pageKey = new URL(tabs[0].url).origin + new URL(tabs[0].url).pathname;
      const profileKey = `${pageKey}::${selectedProfile}`;

      chrome.storage.local.remove(profileKey, () => {
        alert("Profile deleted!");
        updateProfileList(); // Refresh after deletion
      });
    });
  });

  updateProfileList(); // Load profiles on popup open
});
