export interface AvatarUser {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface AvatarMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
}

interface AvatarDropDownProps {
  user: AvatarUser;
  isOpen: boolean;
  onClose?: () => void;
  items?: AvatarMenuItem[];
}

export type { AvatarDropDownProps };
