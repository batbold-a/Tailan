import React from 'react';
import { Card, Button, Input, Label } from '../components/UI';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Upload,
  X,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Assignment, FrequencyType, TargetType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export const AssignmentsPage = () => {
  const { session } = useAuth();
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('All');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);
  const [editingAsg, setEditingAsg] = React.useState<Assignment | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    category: '',
    frequency_type: 'Monthly' as FrequencyType,
    target_type: 'Count' as TargetType,
    annual_target: 0,
    unit: '',
    notes: ''
  });

  // Bulk State
  const [bulkText, setBulkText] = React.useState('');

  React.useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setAssignments(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const payload = {
      ...formData,
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingAsg) {
        const { error } = await supabase.from('assignments').update(payload).eq('id', editingAsg.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('assignments').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingAsg(null);
      setFormData({ 
        name: '', 
        category: '', 
        frequency_type: 'Monthly', 
        target_type: 'Count', 
        annual_target: 0, 
        unit: '',
        notes: '' 
      });
      fetchAssignments();
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      alert('Failed to save assignment: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment? All associated plans and actuals will be removed.')) return;
    await supabase.from('assignments').delete().eq('id', id);
    fetchAssignments();
  };

  const handleBulkImport = async () => {
    if (!session || !bulkText.trim()) return;

    const lines = bulkText.trim().split('\n');
    const newAssignments = lines.map(line => {
      const [name, category, frequency, target, type] = line.split('|').map(s => s.trim());
      return {
        name,
        category: category || 'General',
        frequency_type: (frequency || 'Monthly') as FrequencyType,
        target_type: (type || 'Count') as TargetType,
        annual_target: parseInt(target) || 0,
        user_id: session.user.id
      };
    }).filter(a => a.name);

    const { error } = await supabase.from('assignments').insert(newAssignments);
    if (error) {
      alert('Error importing: ' + error.message);
    } else {
      setIsBulkOpen(false);
      setBulkText('');
      fetchAssignments();
    }
  };

  const categories = ['All', ...new Set(assignments.map(a => a.category))];
  const filtered = assignments.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                         a.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-500 mt-1">Manage your annual targets and work categories.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsBulkOpen(true)}>
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
          <Button className="gap-2" onClick={() => {
            setEditingAsg(null);
            setFormData({ 
              name: '', 
              category: '', 
              frequency_type: 'Monthly', 
              target_type: 'Count', 
              annual_target: 0, 
              unit: '',
              notes: '' 
            });
            setIsModalOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            New Assignment
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search assignments..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Annual Target</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-4 h-16 bg-slate-50 rounded-lg mb-2"></td>
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((asg) => (
                  <tr key={asg.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-slate-900">{asg.name}</div>
                      {asg.notes && <div className="text-xs text-slate-500 truncate max-w-xs">{asg.notes}</div>}
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {asg.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        asg.target_type === 'Percentage' ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {asg.target_type}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-900 font-mono font-semibold">
                      {asg.annual_target}{asg.target_type === 'Percentage' ? '%' : (asg.unit ? ` ${asg.unit}` : '')}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingAsg(asg);
                            setFormData({
                              name: asg.name,
                              category: asg.category,
                              frequency_type: asg.frequency_type,
                              target_type: asg.target_type || 'Count',
                              annual_target: asg.annual_target,
                              unit: asg.unit || '',
                              notes: asg.notes || ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(asg.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No assignments found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingAsg ? 'Edit Assignment' : 'New Assignment'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="name">Assignment Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Monthly Safety Audit" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    required 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Operations" 
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <select 
                    id="frequency"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    value={formData.frequency_type}
                    onChange={(e) => setFormData({...formData, frequency_type: e.target.value as FrequencyType})}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_type">Target Type</Label>
                  <select 
                    id="target_type"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    value={formData.target_type}
                    onChange={(e) => setFormData({...formData, target_type: e.target.value as TargetType})}
                  >
                    <option value="Count">Count (Numeric)</option>
                    <option value="Percentage">Percentage (0-100%)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="target">Annual Target {formData.target_type === 'Percentage' ? '(%)' : ''}</Label>
                  <Input 
                    id="target" 
                    type="number" 
                    min="0" 
                    max={formData.target_type === 'Percentage' ? "100" : undefined}
                    required 
                    placeholder="0"
                    value={formData.annual_target === 0 ? '' : formData.annual_target}
                    onChange={(e) => setFormData({...formData, annual_target: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              {formData.target_type === 'Count' && (
                <div>
                  <Label htmlFor="unit">Unit (Optional)</Label>
                  <Input 
                    id="unit" 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="e.g. audits, reports, sessions" 
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea 
                  id="notes"
                  className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Assignment</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Bulk Import Assignments</h2>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-800 font-medium">Format: Name | Category | Frequency | AnnualTarget</p>
                <p className="text-xs text-indigo-600 mt-1">Example: Safety Audit | Operations | Monthly | 12</p>
              </div>

              <textarea 
                className="w-full min-h-[300px] rounded-lg border border-slate-200 bg-white p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                placeholder="One assignment per line..."
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
                <Button onClick={handleBulkImport} disabled={!bulkText.trim()}>
                  Import {bulkText.trim().split('\n').filter(l => l.trim()).length} Assignments
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
