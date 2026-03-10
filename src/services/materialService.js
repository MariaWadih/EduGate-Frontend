import client from '../api/client';

export const materialService = {
    getMaterials: (classId, subjectId) => {
        const params = new URLSearchParams();
        if (classId) params.append('class_id', classId);
        if (subjectId) params.append('subject_id', subjectId);
        return client.get(`/materials?${params.toString()}`);
    },

    downloadFile: (path) => client.get(`/materials/download?path=${encodeURIComponent(path)}`),

    downloadAllByCourse: (classId, subjectId) => {
        return client.get(`/materials/download-all?class_id=${classId}&subject_id=${subjectId}`, {
            responseType: 'blob'
        });
    },

    uploadMaterial: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return client.post('/materials', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    deleteMaterial: (id) => client.delete(`/materials/${id}`)
};
