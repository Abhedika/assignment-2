export const MediaTypeOptions = { Images: 'Images', Videos: 'Videos', All: 'All' };
export const requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted', granted: true });
export const requestCameraPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted', granted: true });
export const launchImageLibraryAsync = jest.fn().mockResolvedValue({ canceled: true, assets: [] });
export const launchCameraAsync = jest.fn().mockResolvedValue({ canceled: true, assets: [] });
