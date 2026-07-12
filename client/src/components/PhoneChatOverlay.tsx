import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PhoneChat, PhoneChatMessage } from "../types/game";
import { playOneShotSound } from "../services/scriptedAudio";

interface Props {
  chat: PhoneChat;
  sceneId: string;
  onComplete?: () => void;
}

type VisibleMessage = PhoneChatMessage & {
  internalId: string;
};

type PreparedMessage = VisibleMessage & {
  typingMs: number;
};

function getInitial(sender: string) {
  return sender.trim().slice(0, 1) || "?";
}

function getMessageAlign(message: PhoneChatMessage): "left" | "right" | "center" {
  if (message.system) return "center";
  if (message.align) return message.align;
  return message.sender === "叶平生" ? "right" : "left";
}

export function PhoneChatOverlay({ chat, sceneId, onComplete }: Props) {
  const [visibleMessages, setVisibleMessages] = useState<VisibleMessage[]>([]);
  const [typingMessage, setTypingMessage] = useState<PreparedMessage | null>(null);
  const [nextIndex, setNextIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<number | null>(null);
  const completionRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const firstRenderRef = useRef(true);
  const resetScrollRef = useRef(false);

  const messages = useMemo<PreparedMessage[]>(
    () => chat.messages.map((message, index) => {
      const align = getMessageAlign(message);
      return {
        ...message,
        align,
        internalId: message.id ?? `${sceneId}_${index}`,
        typingMs: message.system || align === "center" ? 0 : (message.typingMs ?? 550),
      };
    }),
    [chat.messages, sceneId],
  );

  const initialMessages = useMemo<VisibleMessage[]>(
    () => (chat.initialMessages ?? []).map((message, index) => ({
      ...message,
      align: getMessageAlign(message),
      internalId: message.id ?? `${sceneId}_history_${index}`,
    })),
    [chat.initialMessages, sceneId],
  );

  const finish = useCallback(() => {
    if (completionRef.current) return;
    completionRef.current = true;
    setTypingMessage(null);
    setCompleted(true);
    onComplete?.();
  }, [onComplete]);

  const revealMessage = useCallback((message: PreparedMessage) => {
    setTypingMessage(null);
    setVisibleMessages(prev => [...prev, message]);
    setNextIndex(prev => prev + 1);
    playOneShotSound("message_ping");
  }, []);

  const advance = useCallback(() => {
    if (completed) return;

    if (chat.view === "members" || chat.view === "announcement") {
      finish();
      return;
    }

    if (typingMessage) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      revealMessage(typingMessage);
      if (nextIndex >= messages.length - 1) {
        window.setTimeout(finish, 0);
      }
      return;
    }

    const message = messages[nextIndex];
    if (!message) {
      finish();
      return;
    }

    if (message.typingMs > 0) {
      setTypingMessage(message);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        revealMessage(message);
        if (nextIndex >= messages.length - 1) {
          window.setTimeout(finish, 0);
        }
      }, message.typingMs);
      return;
    }

    revealMessage(message);
    if (nextIndex >= messages.length - 1) {
      window.setTimeout(finish, 0);
    }
  }, [chat.view, completed, finish, messages, nextIndex, revealMessage, typingMessage]);

  useEffect(() => {
    setVisibleMessages(initialMessages);
    setTypingMessage(null);
    setNextIndex(0);
    setCompleted(false);
    completionRef.current = false;
    resetScrollRef.current = true;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [sceneId, messages]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      if (completed) return;
      event.preventDefault();
      event.stopPropagation();
      advance();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [advance, completed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: resetScrollRef.current ? "auto" : "smooth",
    });
    resetScrollRef.current = false;
  }, [visibleMessages, typingMessage]);

  useEffect(() => {
    if (chat.view === "members" || chat.view === "announcement") return;
    if (messages.length === 0) {
      finish();
    }
  }, [chat.view, finish, messages.length]);

  const typingAlign = typingMessage ? getMessageAlign(typingMessage) : "left";

  const shouldAnimateAppear = firstRenderRef.current;
  firstRenderRef.current = false;

  return (
    <div className={`phone-chat-stage ${chat.position ?? "center"}`}>
      <div className={`phone-chat-device${shouldAnimateAppear ? "" : " stable"}`} onClick={advance}>
        <div className="phone-chat-speaker" />
        <div className="phone-chat-header">
          <div className="phone-chat-title">{chat.title}</div>
          {chat.subtitle && <div className="phone-chat-subtitle">{chat.subtitle}</div>}
        </div>

        {chat.view === "members" ? (
          <div className="phone-chat-body phone-chat-members" ref={scrollRef}>
            {(chat.members ?? []).map((member, index) => (
              <div className="phone-member-row" key={`${sceneId}_member_${member}_${index}`}>
                <div className="phone-chat-avatar">{getInitial(member)}</div>
                <div className="phone-member-name">{member}</div>
                {index === 3 && <div className="phone-member-badge">群主</div>}
              </div>
            ))}
          </div>
        ) : chat.view === "announcement" ? (
          <div className="phone-chat-body phone-chat-announcement" ref={scrollRef}>
            <div className="phone-announcement-title">群公告</div>
            <div className="phone-announcement-card">{chat.announcement ?? "看宣传册。"}</div>
          </div>
        ) : (
          <div className="phone-chat-body" ref={scrollRef}>
            {visibleMessages.map(message => {
              const align = getMessageAlign(message);
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
            {typingMessage && (
              <div className={`phone-chat-row ${typingAlign}`}>
                {typingAlign === "left" && <div className="phone-chat-avatar">{getInitial(typingMessage.sender)}</div>}
                <div className={`phone-chat-bubble ${typingAlign} typing`}>
                  <div className="phone-chat-sender">{typingMessage.sender}</div>
                  <div className="phone-chat-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                {typingAlign === "right" && <div className="phone-chat-avatar self">{getInitial(typingMessage.sender)}</div>}
              </div>
            )}
          </div>
        )}

        <div className="phone-chat-footer">
          {completed ? "按空格继续" : "按空格查看下一步"}
        </div>
      </div>
    </div>
  );
}
