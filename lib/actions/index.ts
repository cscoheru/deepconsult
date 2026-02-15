/**
 * Server Actions Index
 * 统一导出所有 Server Actions
 */

// Diagnosis Session Actions
export {
  createDiagnosisSession,
  getUserDiagnosisSessions,
  getDiagnosisSessionWithMessages,
  updateSessionStage,
  updateDimensionData,
  completeDiagnosisSession,
  deleteDiagnosisSession,
} from './diagnosis';

// Chat Actions
export {
  addChatMessage,
  getChatMessages,
  getRecentChatMessages,
  deleteChatMessage,
  batchAddChatMessages,
} from './chat';

// Profile Actions
export {
  getCurrentUserProfile,
  updateUserProfile,
  updateCompanyInfo,
  checkProfileCompleteness,
  deleteUserAccount,
} from './profile';
