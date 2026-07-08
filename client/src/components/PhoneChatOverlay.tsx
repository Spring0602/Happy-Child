import { useEffect, useMemo, useRef, useState } from "react";
import type { PhoneChat, PhoneChatMessage } from "../types/game";

interface Props {
  chat: PhoneChat;
  sceneId: string;
  onComplete?: () => void;
}

type VisibleMessage = PhoneChatMessage & {
  internalId: string;
};

function getInitial(sender: string) {
  return sender.trim().slice(0, 1) || "?";
}

export function PhoneChatOverlay({ chat, sceneId, onComplete }: Props) {
  const [visibleMessages, setVisibleMessages] = useState<VisibleMessage[]>([]);
  const [typingSender, setTypingSender] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo(
    () => chat.messages.map((message, index) => ({
      ...message,
      internalId: message.id ?? `${sceneId}_${index}`,
      delayMs: message.delayMs ?? 450,
      typingMs: message.system || message.align === "center" ? 0 : (message.typingMs ?? 800),
    })),
    [chat.messages, sceneId],
  );

  useEffect(() => {
    setVisibleMessages([]);
    setTypingSender(null);
    setCompleted(false);
    timersRef.current.forEach(timer => window.clearTimeout(timer));
    timersRef.current = [];

    let elapsed = 300;
    messages.forEach((message, index) => {
      elapsed += message.delayMs ?? 0;
      if ((message.typingMs ?? 0) > 0) {
        const typingTimer = window.setTimeout(() => {
          setTypingSender(message.sender);
        }, elapsed);
        timersRef.current.push(typingTimer);
        elapsed += message.typingMs ?? 0;
      }

      const messageTimer = window.setTimeout(() => {
        setTypingSender(null);
        setVisibleMessages(prev => [...prev, message]);
        if (index === messages.length - 1) {
          const doneTimer = window.setTimeout(() => {
            setCompleted(true);
            onComplete?.();
          }, 400);
          timersRef.current.push(doneTimer);
        }
      }, elapsed);
      timersRef.current.push(messageTimer);
    });

    if (messages.length === 0) {
      const doneTimer = window.setTimeout(() => {
        setCompleted(true);
        onComplete?.();
      }, 300);
      timersRef.current.push(doneTimer);
    }

    return () => {
      timersRef.current.forEach(timer => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [messages, onComplete]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleMessages, typingSender]);

  function handleSkip() {
    if (completed) return;
    timersRef.current.forEach(timer => window.clearTimeout(timer));
    timersRef.current = [];
    setTypingSender(null);
    setVisibleMessages(messages);
    setCompleted(true);
    onComplete?.();
  }

  return (
    <div className={`phone-chat-stage ${chat.position ?? "center"}`}>
      <div className="phone-chat-device" onClick={handleSkip}>
        <div className="phone-chat-speaker" />
        <div className="phone-chat-header">
          <div className="phone-chat-title">{chat.title}</div>
          {chat.subtitle && <div className="phone-chat-subtitle">{chat.subtitle}</div>}
        </div>
        <div className="phone-chat-body" ref={scrollRef}>
          {visibleMessages.map(message => {
            const align = message.system ? "center" : (message.align ?? "left");
            return (
              <div key={message.internalId} className={`phone-chat-row ${align}`}>
                {align === "left" && (
                  <div className="phone-chat-avatar">
                    {message.avatar ? <img src={message.avatar} alt={message.sender} /> : getInitial(message.sender)}
                  </div>
                )}
                <div className={`phone-chat-bubble ${align}`}>
                  {align !== "center" && <div className="phone-chat-sender">{message.sender}</div>}
                  <div className="phone-chat-text">{message.text}</div>
                </div>
                {align === "right" && (
                  <div className="phone-chat-avatar self">
                    {message.avatar ? <img src={message.avatar} alt={message.sender} /> : getInitial(message.sender)}
                  </div>
                )}
              </div>
            );
          })}
          {typingSender && (
            <div className="phone-chat-row left">
              <div className="phone-chat-avatar">{getInitial(typingSender)}</div>
              <div className="phone-chat-bubble left typing">
                <div className="phone-chat-sender">{typingSender}</div>
                <div className="phone-chat-typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="phone-chat-footer">
          {completed ? "消息已读" : "点击手机可快进消息"}
        </div>
      </div>
    </div>
  );
}
