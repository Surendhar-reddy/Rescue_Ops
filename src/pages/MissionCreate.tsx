import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FileUpload, { UploadedFile } from '@/components/mission/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, MapPin, AlertTriangle, ArrowLeft, Rocket } from 'lucide-react';

type DisasterType = 'flood' | 'earthquake' | 'cyclone' | 'fire' | 'landslide' | 'tsunami' | 'other';

const MissionCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [disasterType, setDisasterType] = useState<DisasterType | ''>('');
  const [region, setRegion] = useState('');
  const [authorityLat, setAuthorityLat] = useState('');
  const [authorityLon, setAuthorityLon] = useState('');
  const [notes, setNotes] = useState('');

  const disasterTypes: { value: DisasterType; label: string; icon: string }[] = [
    { value: 'flood', label: 'Flood', icon: '🌊' },
    { value: 'earthquake', label: 'Earthquake', icon: '🌍' },
    { value: 'cyclone', label: 'Cyclone', icon: '🌀' },
    { value: 'fire', label: 'Wildfire', icon: '🔥' },
    { value: 'landslide', label: 'Landslide', icon: '⛰️' },
    { value: 'tsunami', label: 'Tsunami', icon: '🌊' },
    { value: 'other', label: 'Other', icon: '⚠️' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Authentication required');
      return;
    }

    if (!disasterType || !region) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      // Create mission
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .insert({
          created_by: user.id,
          disaster_type: disasterType,
          region: region.trim(),
          authority_lat: authorityLat ? parseFloat(authorityLat) : null,
          authority_lon: authorityLon ? parseFloat(authorityLon) : null,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (missionError) throw missionError;

      // Upload files
      if (files.length > 0) {
        for (const uploadedFile of files) {
          const fileExt = uploadedFile.file.name.split('.').pop();
          const fileName = `${mission.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('mission-files')
            .upload(fileName, uploadedFile.file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('mission-files')
            .getPublicUrl(fileName);

          // Save upload record
          await supabase.from('uploads').insert({
            mission_id: mission.id,
            file_type: uploadedFile.file.type.startsWith('video/') ? 'video' : 'image',
            storage_url: publicUrl,
            file_name: uploadedFile.file.name,
            file_size: uploadedFile.file.size,
          });
        }
      }

      toast.success('Mission created successfully');
      navigate(`/mission/${mission.id}/dashboard`);
    } catch (error) {
      console.error('Error creating mission:', error);
      toast.error('Failed to create mission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4 text-muted-foreground"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Missions
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Create New Mission</h1>
            <p className="text-muted-foreground mt-1">
              Upload reconnaissance data and define the disaster context for AI analysis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Section */}
            <div className="ops-panel">
              <div className="ops-panel-header">
                <h2 className="font-semibold text-foreground">RECONNAISSANCE DATA</h2>
                <span className="text-xs font-mono text-muted-foreground">
                  {files.length} FILE{files.length !== 1 ? 'S' : ''} QUEUED
                </span>
              </div>
              <div className="ops-panel-content">
                <FileUpload files={files} onFilesChange={setFiles} />
              </div>
            </div>

            {/* Mission Context */}
            <div className="ops-panel">
              <div className="ops-panel-header">
                <h2 className="font-semibold text-foreground">MISSION CONTEXT</h2>
                <span className="text-xs font-mono text-warning flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  REQUIRED
                </span>
              </div>
              <div className="ops-panel-content space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Disaster Type */}
                  <div className="space-y-2">
                    <Label className="data-label">Disaster Type *</Label>
                    <Select
                      value={disasterType}
                      onValueChange={(v) => setDisasterType(v as DisasterType)}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select disaster type" />
                      </SelectTrigger>
                      <SelectContent>
                        {disasterTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <Label className="data-label">Affected Region *</Label>
                    <Input
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="City, district, or area name"
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                {/* Authority Location */}
                <div className="space-y-2">
                  <Label className="data-label flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    Authority Starting Point (Optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={authorityLat}
                      onChange={(e) => setAuthorityLat(e.target.value)}
                      placeholder="Latitude (e.g., 17.385)"
                      className="bg-input border-border font-mono"
                      type="number"
                      step="any"
                    />
                    <Input
                      value={authorityLon}
                      onChange={(e) => setAuthorityLon(e.target.value)}
                      placeholder="Longitude (e.g., 78.486)"
                      className="bg-input border-border font-mono"
                      type="number"
                      step="any"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Coordinates for relief HQ or staging area. Used for route calculation.
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="data-label">Additional Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional context for the AI agents (severity estimates, known hazards, priority areas...)"
                    className="bg-input border-border min-h-24 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || !disasterType || !region}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Mission...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Launch Mission
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MissionCreate;
