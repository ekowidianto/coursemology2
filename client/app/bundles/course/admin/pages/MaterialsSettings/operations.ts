import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  MaterialsSettingsData,
  MaterialsSettingsPostData,
} from 'types/course/admin/materials';

type Data = Promise<MaterialsSettingsData>;

export const fetchMaterialsSettings = async (): Data => {
  const response = await CourseAPI.admin.materials.index();
  return response.data;
};

export const updateMaterialsSettings = async (
  data: MaterialsSettingsData,
): Data => {
  const adaptedData: MaterialsSettingsPostData = {
    settings_materials_component: {
      title: data.title,
    },
  };

  try {
    const response = await CourseAPI.admin.materials.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data.errors;
    throw error;
  }
};
