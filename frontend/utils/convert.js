
export const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
})


export function convertDate(texteDate){
  
    const date = new Date(texteDate);

    const heure = date.getHours();
    let minute = date.getMinutes();
    minute = minute < 10 ? `0${minute}` : minute;

    return `${heure}:${minute}`
}

export function formatDate(date) {
   
    let inputDate = new Date(date)
    const day = String(inputDate.getDate()).padStart(2, '0');
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const year = inputDate.getFullYear();
    const hours = String(inputDate.getHours()).padStart(2, '0');
    const minutes = String(inputDate.getMinutes()).padStart(2, '0');
  
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
  
    return formattedDate;
  }
  