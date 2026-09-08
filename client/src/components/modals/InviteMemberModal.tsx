import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { projectsApi, authApi } from '../../api';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectMemberRole, User } from '../../types';
import { Avatar } from '../common/Avatar';
import { Search } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingMemberIds: string[];
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  existingMemberIds,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectMemberRole>('MEMBER');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const handleSearch = async (val: string) => {
    setEmail(val);
    setSelectedUser(null);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      try {
        const users = await authApi.searchUsers(val);

        setSearchResults(
          users.filter((u) => !existingMemberIds.includes(u._id))
        );
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEmail(user.email);
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !selectedUser) {
      setError('Please provide an email or choose a user');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await projectsApi.addMember(projectId, {
        userId: selectedUser?._id,
        email: email.trim().toLowerCase(),
        role,
      });

      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast('Member added to project successfully', 'success');

      setEmail('');
      setSelectedUser(null);
      setSearchResults([]);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add member';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Member"
      description="Collaborate with your team by adding members to this project."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
            {error}
          </div>
        )}

        <div className="relative">
          <Input
            label="User Email or Name"
            placeholder="Search by name or email (e.g. sarah@nova.dev)"
            value={email}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            required
          />

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
              {searchResults.map((u) => (
                <button
                  type="button"
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-800 transition-colors text-left"
                >
                  <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200">{u.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="flex items-center gap-3 p-2.5 bg-brand-500/10 border border-brand-500/30 rounded-lg">
            <Avatar name={selectedUser.name} src={selectedUser.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-100">{selectedUser.name}</p>
              <p className="text-[11px] text-slate-400">{selectedUser.title || selectedUser.department}</p>
            </div>
            <span className="text-[10px] text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded">
              Selected
            </span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Project Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectMemberRole)}
            className="w-full bg-[#131d33] border border-slate-700/80 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="MEMBER">Member (Create & edit tasks)</option>
            <option value="ADMIN">Admin (Manage members, settings & tasks)</option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Admins can add/remove members and modify project settings.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            Add to Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
