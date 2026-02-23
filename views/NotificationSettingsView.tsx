
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Schedule } from '../types';
import { Clock, Save, Trash2, Play } from 'lucide-react';

interface NotificationConfig {
  id: string;
  schedule_id: string;
  check_time: string; // "08:00"
  message_template: string;
  active: boolean;
}

interface NotificationSettingsViewProps {
  schedules: Schedule[];
  onBack?: () => void;
}

const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({ schedules }) => {
  const [configs, setConfigs] = useState<NotificationConfig[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [checkTime, setCheckTime] = useState('08:00');
  const [messageTemplate, setMessageTemplate] = useState('Olá {person}, você está escalado como {role} hoje.');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_configs')
      .select('*');
    if (data) setConfigs(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedScheduleId) return alert("Selecione uma escala");
    
    // Check if config already exists for this schedule
    const existing = configs.find(c => c.schedule_id === selectedScheduleId);
    
    const payload = {
      schedule_id: selectedScheduleId,
      check_time: checkTime,
      message_template: messageTemplate,
      active: isActive
    };

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from('notification_configs')
        .update(payload)
        .eq('id', existing.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('notification_configs')
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Configuração salva com sucesso!");
      fetchConfigs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover configuração?")) return;
    const { error } = await supabase.from('notification_configs').delete().eq('id', id);
    if (!error) {
      setConfigs(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Configuração de Notificações Diárias</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Escala para Notificar</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={selectedScheduleId}
              onChange={e => setSelectedScheduleId(e.target.value)}
            >
              <option value="">Selecione uma escala...</option>
              {schedules.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Horário de Verificação (Diário)</label>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <input 
                type="time" 
                className="flex-1 p-2 border rounded-lg"
                value={checkTime}
                onChange={e => setCheckTime(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-500">O sistema irá verificar a escala neste horário todos os dias.</p>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700">Modelo da Mensagem</label>
            <textarea 
              className="w-full p-2 border rounded-lg h-24 font-mono text-sm"
              value={messageTemplate}
              onChange={e => setMessageTemplate(e.target.value)}
            />
            <p className="text-xs text-slate-500">Variáveis disponíveis: {'{person}'}, {'{role}'}, {'{day}'}.</p>
          </div>
          
          <div className="flex items-center gap-2">
             <input 
              type="checkbox" 
              id="active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="active" className="text-sm text-slate-700">Ativar notificações automáticas</label>
          </div>

        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Save size={18} />
            Salvar Configuração
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h3 className="text-lg font-semibold text-slate-800 mb-4">Configurações Ativas</h3>
         
         {loading ? <p>Carregando...</p> : (
            <div className="space-y-4">
              {configs.length === 0 && <p className="text-slate-500 text-sm">Nenhuma configuração ativa.</p>}
              
              {configs.map(config => {
                const scheduleName = schedules.find(s => s.id === config.schedule_id)?.name || 'Escala Desconhecida';
                return (
                  <div key={config.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <h4 className="font-medium text-slate-800">{scheduleName}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock size={14}/> {config.check_time}</span>
                        <span className={config.active ? "text-green-600 font-medium" : "text-slate-400"}>
                          {config.active ? "Ativo" : "Pausado"}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(config.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
         )}
      </div>
    </div>
  );
};

export default NotificationSettingsView;
