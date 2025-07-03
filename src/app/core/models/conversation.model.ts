// src/app/core/models/conversation.model.ts

export interface Conversation {
    id: string;
    enterpriseId: string;
    userName: string;
    userPhone: string;
    startedAt: string;
    isActive: boolean;
    lastInteractionAt: string;
    threadId: string;
    leadQualification?: LeadQualification;
    messages?: Message[];
    messageCount: number;
  }
  
  export interface LeadQualification {
    id: string;
    qualifiedAt: string;
    status: number;
    score: number;
    analysisSummary: string;
    tags: LeadTag[];
    conversationId: string;
  }
  
  export interface LeadTag {
    key: string;
    value: string;
  }
  
  export interface Message {
    id: string;
    role: number; 
    body: string;
    createdAt: string;
    conversation: Conversation;
  }
  
  export interface ConversationDetail extends Conversation {
    messages: Message[];
    leadQualification?: LeadQualification;
  }
  
  export interface ConversationListResponse {
    conversations: Conversation[];
    totalCount: number;
    hasNextPage: boolean;
  }