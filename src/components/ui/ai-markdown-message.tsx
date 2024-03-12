import Markdown from 'react-markdown';
import { AiMessage } from './ai-message';

export const AiMarkdownMessage = ({ children }: { children: string }) => {
  return (
    <AiMessage>
      <Markdown>{children}</Markdown>
    </AiMessage>
  );
};
