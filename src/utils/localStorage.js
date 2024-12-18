export const STORAGE_KEYS = {
    PATIENTS: 'patient_records',
    FORM_DATA: 'patient_form_draft',
    LAST_IPP: 'last_ipp_number',
    EDITING_BACKUP: 'editing_backup'
  };
  
  export const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };
  
  export const getFromLocalStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  };