import axios from "axios"
import { API_URL } from "../config"

export const downloadMidiOrMeiFile = async (fileName: string, recordId: any) => {
  const response = await axios.get(`${API_URL}v1/uploads/${recordId}-${fileName}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};