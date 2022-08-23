import MockAdapter from 'axios-mock-adapter';

import {
  act,
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from 'utilities/test-utils';
import FileManager from '..';
import CourseAPI from 'api/course';

const FOLDER_ID = 1;

const MATERIALS = [
  {
    id: 1,
    name: `Material 1`,
    updated_at: `2017-01-01T01:00:00.0000000Z`,
    deleting: false,
  },
  {
    id: 2,
    name: `Material 2`,
    updated_at: `2017-01-01T02:00:00.0000000Z`,
    deleting: false,
  },
];

const NEW_MATERIAL = {
  id: 10,
  name: 'Material 3',
  updated_at: '2017-01-01T08:00:00.0000000Z',
  deleting: false,
};

const client = CourseAPI.materialFolders.getClient();
const mock = new MockAdapter(client);

let fileManager: RenderResult;
beforeEach(() => {
  fileManager = render(
    <FileManager materials={MATERIALS} folderId={FOLDER_ID} />,
  );
});

beforeEach(mock.reset);

describe('<FileManager />', () => {
  it('shows existing files', () => {
    expect(fileManager.getByText('Material 1')).toBeVisible();
    expect(fileManager.getByText('Material 2')).toBeVisible();
  });

  it('uploads a new file and shows it', async () => {
    mock
      .onPut(
        `/courses/${global.courseId}/materials/folders/${FOLDER_ID}/upload_materials`,
      )
      .reply(200, {
        materials: [NEW_MATERIAL],
      });

    const uploadApi = jest.spyOn(CourseAPI.materialFolders, 'upload');
    const addFilesButton = fileManager.getByText('Add Files');
    expect(addFilesButton).toBeVisible();

    const fileInput = fileManager.getByTestId('FileInput');

    act(() => {
      fireEvent.change(fileInput, {
        target: { files: [{ name: NEW_MATERIAL.name }] },
      });
    });

    await waitFor(() => expect(uploadApi).toHaveBeenCalled());

    const newMaterialRow = await fileManager.findByText(NEW_MATERIAL.name);
    expect(newMaterialRow).toBeVisible();
  });
});
