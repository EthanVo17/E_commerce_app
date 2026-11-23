export interface AvatarUser {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
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
