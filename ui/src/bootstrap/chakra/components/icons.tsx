import { chakra } from '@chakra-ui/react';

import { FaCaretDown, FaCaretRight, FaTimes, FaCog, FaKey, FaLink } from 'react-icons/fa';
import { FaEye, FaHome } from 'react-icons/fa';
import { FaEyeSlash } from 'react-icons/fa';
import { HiOutlineRefresh } from 'react-icons/hi';
import { MdAddCircleOutline } from 'react-icons/md';
import { IoTrashOutline } from 'react-icons/io5';
import { BsPencil } from 'react-icons/bs';
import { MdContentCopy } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';
import { FaRegAddressBook } from 'react-icons/fa';

export const CloseIcon = chakra(FaTimes);
export const PasswordVisibleIcon = chakra(FaEye);
export const PasswordHiddenIcon = chakra(FaEyeSlash);
export const RefreshIcon = chakra(HiOutlineRefresh);
export const AddCircleIcon = chakra(MdAddCircleOutline);
export const DeleteIcon = chakra(IoTrashOutline);
export const EditIcon = chakra(BsPencil);
export const CopyIcon = chakra(MdContentCopy);
export const SettingsIcon = chakra(FaCog);
export const PasswordIcon = chakra(FaKey);
export const UserIcon = chakra(AiOutlineUser);
export const ExpandIcon = chakra(FaCaretRight);
export const CollapseIcon = chakra(FaCaretDown);
export const AddressIcon = chakra(FaRegAddressBook);
export const HomeIcon = chakra(FaHome);
export const LinkIcon = chakra(FaLink);
