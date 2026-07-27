/**
 * Corporates admin — partnered companies (Corporate Meals program).
 *
 * Two tabs:
 *   Corporates — list + create/edit (code, LOCKED office address, per-window
 *                meal cap, contacts) + per-corporate voucher plans.
 *   Leads      — "partner with us" requests from the consumer app; approving
 *                one opens the create form prefilled and links the lead.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Platform,
  ToastAndroid,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import { Card } from '../../../components/common/Card';
import { useAlert } from '../../../hooks/useAlert';
import { GradientBox } from '../../../components/common/GradientBox';
import { LocationPickerModal } from '../../kitchens/components/LocationPickerModal';
import areaService from '../../../services/area.service';
import corporateService, {
  Corporate,
  CorporateLead,
  CorporatePlan,
  CreateCorporateInput,
  CreateCorporatePlanInput,
} from '../../../services/corporate.service';

interface CorporatesScreenProps {
  onMenuPress?: () => void;
}

type CorporateFormState = {
  name: string;
  code: string;
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  maxMealsPerWindow: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
};

const EMPTY_FORM: CorporateFormState = {
  name: '',
  code: '',
  addressLine1: '',
  addressLine2: '',
  locality: '',
  city: 'Indore',
  state: 'Madhya Pradesh',
  pincode: '',
  latitude: '',
  longitude: '',
  maxMealsPerWindow: '2',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  notes: '',
};

type PlanFormState = {
  name: string;
  voucherCount: string;
  price: string;
  voucherValidityDays: string;
  perMealDeliveryFee: string;
};

const EMPTY_PLAN_FORM: PlanFormState = {
  name: '',
  voucherCount: '',
  price: '',
  voucherValidityDays: '60',
  perMealDeliveryFee: '0',
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'phone-pad' | 'email-address';
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
}> = ({ label, value, onChange, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }) => (
  <View className="mb-3">
    <Text className="text-xs text-gray-500 mb-1">{label}</Text>
    <TextInput
      className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

const CorporatesScreen: React.FC<CorporatesScreenProps> = ({ onMenuPress }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlert();

  const [tab, setTab] = useState<'corporates' | 'leads'>('corporates');

  const { data: corporates, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['corporates'],
    queryFn: () => corporateService.listCorporates(),
  });
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['corporateLeads'],
    queryFn: () => corporateService.listLeads(),
  });

  // ── Corporate create/edit modal state ──
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Corporate | null>(null);
  const [sourceLeadId, setSourceLeadId] = useState<string | null>(null);
  const [form, setForm] = useState<CorporateFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  // Location helpers (same flow as the Add/Edit Kitchen form).
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);

  // ── Detail (plans) modal state ──
  const [detailFor, setDetailFor] = useState<Corporate | null>(null);
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['corporateDetail', detailFor?._id],
    queryFn: () => corporateService.getCorporate(detailFor!._id),
    enabled: !!detailFor,
  });
  const [planForm, setPlanForm] = useState<PlanFormState>(EMPTY_PLAN_FORM);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  const set = (field: keyof CorporateFormState) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }));

  // Coords for the map picker so it opens on the already-set location (edit),
  // else null (picker centers on a sensible default).
  const initialMapCoords = (() => {
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { latitude: lat, longitude: lng };
  })();

  // Reverse-geocode via the backend's Google proxy (key stays server-side);
  // best-effort, silently no-ops on failure. Only fills EMPTY fields so it
  // never clobbers something the admin already typed.
  const reverseGeocodeAndFill = async (latitude: number, longitude: number) => {
    try {
      const r = await areaService.reverseGeocode(latitude, longitude);
      setForm((prev) => ({
        ...prev,
        addressLine1: prev.addressLine1 || r.addressLine1 || '',
        addressLine2: prev.addressLine2 || r.addressLine2 || '',
        locality: prev.locality || r.locality || '',
        city: prev.city || r.city || '',
        state: prev.state || r.state || '',
        pincode: r.pincode && /^\d{6}$/.test(r.pincode) ? r.pincode : prev.pincode,
      }));
      return true;
    } catch {
      return false;
    }
  };

  // Map-pick confirm: write coords + merge any resolved address fields.
  const handleMapPick = (result: {
    latitude: number;
    longitude: number;
    addressLine1?: string;
    addressLine2?: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => {
    setForm((prev) => ({
      ...prev,
      latitude: result.latitude.toFixed(6),
      longitude: result.longitude.toFixed(6),
      addressLine1: result.addressLine1 || prev.addressLine1,
      addressLine2: result.addressLine2 || prev.addressLine2,
      locality: result.locality || prev.locality,
      city: result.city || prev.city,
      state: result.state || prev.state,
      pincode: result.pincode && /^\d{6}$/.test(result.pincode) ? result.pincode : prev.pincode,
    }));
    setMapPickerVisible(false);
  };

  const detectLocation = async () => {
    try {
      setDetectingLocation(true);
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Tiffsy needs your location to set the office coordinates.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showError('Permission Denied', 'Location permission is required to detect coordinates.');
          setDetectingLocation(false);
          return;
        }
      }
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setForm((prev) => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
          }));
          const filled = await reverseGeocodeAndFill(latitude, longitude);
          setDetectingLocation(false);
          if (Platform.OS === 'android') {
            ToastAndroid.show(
              filled ? 'Location & address detected' : 'Location detected (address lookup failed)',
              ToastAndroid.SHORT,
            );
          }
        },
        (error) => {
          console.error('[Corporate DetectLocation] error:', error?.message);
          setDetectingLocation(false);
          showError('Location Error', 'Could not detect location. Enter coordinates manually or pick on the map.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {
      setDetectingLocation(false);
      showError('Error', 'Failed to detect location.');
    }
  };

  const openCreate = (prefill?: Partial<CorporateFormState>, leadId?: string) => {
    setEditing(null);
    setSourceLeadId(leadId || null);
    setForm({ ...EMPTY_FORM, ...prefill });
    setFormVisible(true);
  };

  const openEdit = (c: Corporate) => {
    setEditing(c);
    setSourceLeadId(null);
    setForm({
      name: c.name,
      code: c.code,
      addressLine1: c.lockedAddress.addressLine1,
      addressLine2: c.lockedAddress.addressLine2 || '',
      locality: c.lockedAddress.locality,
      city: c.lockedAddress.city,
      state: c.lockedAddress.state || '',
      pincode: c.lockedAddress.pincode,
      latitude: String(c.lockedAddress.coordinates.latitude),
      longitude: String(c.lockedAddress.coordinates.longitude),
      maxMealsPerWindow: String(c.maxMealsPerWindow),
      contactName: c.contactName || '',
      contactPhone: c.contactPhone || '',
      contactEmail: c.contactEmail || '',
      notes: c.notes || '',
    });
    setFormVisible(true);
  };

  const buildPayload = (): CreateCorporateInput | null => {
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (!form.name.trim() || !form.code.trim()) {
      showError('Missing fields', 'Name and corporate code are required');
      return null;
    }
    if (!form.addressLine1.trim() || !form.locality.trim() || !form.city.trim() || !/^[0-9]{6}$/.test(form.pincode)) {
      showError('Invalid address', 'Address line, locality, city and a 6-digit pincode are required');
      return null;
    }
    if (isNaN(lat) || isNaN(lng)) {
      showError('Invalid coordinates', 'Enter the office latitude and longitude (from Google Maps)');
      return null;
    }
    return {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      lockedAddress: {
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        locality: form.locality.trim(),
        city: form.city.trim(),
        state: form.state.trim() || undefined,
        pincode: form.pincode,
        coordinates: { latitude: lat, longitude: lng },
      },
      maxMealsPerWindow: parseInt(form.maxMealsPerWindow, 10) || 2,
      contactName: form.contactName.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      notes: form.notes.trim() || undefined,
      ...(sourceLeadId ? { sourceLeadId } : {}),
    };
  };

  const handleSaveCorporate = async () => {
    const payload = buildPayload();
    if (!payload) return;
    setSaving(true);
    try {
      if (editing) {
        const { code: _omit, sourceLeadId: _omit2, ...updatable } = payload as any;
        await corporateService.updateCorporate(editing._id, updatable);
        showSuccess('Saved', `${payload.name} updated`);
      } else {
        await corporateService.createCorporate(payload);
        showSuccess('Created', `${payload.name} is now a corporate partner`);
      }
      setFormVisible(false);
      queryClient.invalidateQueries({ queryKey: ['corporates'] });
      queryClient.invalidateQueries({ queryKey: ['corporateLeads'] });
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to save corporate');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c: Corporate) => {
    try {
      await corporateService.updateCorporate(c._id, {
        status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      queryClient.invalidateQueries({ queryKey: ['corporates'] });
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to update status');
    }
  };

  const handleAddPlan = async () => {
    if (!detailFor) return;
    const input: CreateCorporatePlanInput = {
      name: planForm.name.trim(),
      voucherCount: parseInt(planForm.voucherCount, 10) || 0,
      price: parseFloat(planForm.price) || 0,
      voucherValidityDays: parseInt(planForm.voucherValidityDays, 10) || 60,
      perMealDeliveryFee: parseFloat(planForm.perMealDeliveryFee) || 0,
    };
    if (!input.name || input.voucherCount < 1 || input.price < 0) {
      showError('Invalid plan', 'Name, voucher count and price are required');
      return;
    }
    setSavingPlan(true);
    try {
      await corporateService.createPlan(detailFor._id, input);
      showSuccess('Plan added', `${input.name} (${input.voucherCount} vouchers)`);
      setPlanForm(EMPTY_PLAN_FORM);
      setShowPlanForm(false);
      queryClient.invalidateQueries({ queryKey: ['corporateDetail', detailFor._id] });
      queryClient.invalidateQueries({ queryKey: ['corporates'] });
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to add plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const togglePlanStatus = async (plan: CorporatePlan) => {
    try {
      await corporateService.updatePlan(plan._id, {
        status: plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      queryClient.invalidateQueries({ queryKey: ['corporateDetail', detailFor?._id] });
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to update plan');
    }
  };

  const rejectLeadMutation = useMutation({
    mutationFn: (id: string) => corporateService.rejectLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporateLeads'] });
      showSuccess('Rejected', 'Lead marked as rejected');
    },
    onError: (err: any) => showError('Error', err?.message || 'Failed to reject lead'),
  });

  const approveLead = (lead: CorporateLead) => {
    openCreate(
      {
        name: lead.companyName,
        contactName: lead.contactName,
        contactPhone: lead.contactPhone,
        contactEmail: lead.contactEmail || '',
        notes: lead.message || '',
      },
      lead._id,
    );
  };

  const pendingLeads = (leads || []).filter((l) => l.status === 'PENDING');
  const settledLeads = (leads || []).filter((l) => l.status !== 'PENDING');

  return (
    <SafeAreaScreen topBackgroundColor="#FE8733" bottomBackgroundColor="#f9fafb" backgroundColor="#f9fafb">
      {/* Header */}
      <GradientBox style={{ paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onMenuPress} className="mr-4">
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold flex-1">Corporates</Text>
        <TouchableOpacity onPress={() => openCreate()} className="bg-white/20 rounded-full px-3 py-1.5 flex-row items-center">
          <Icon name="add" size={18} color="#ffffff" />
          <Text className="text-white font-semibold ml-1">New</Text>
        </TouchableOpacity>
      </GradientBox>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-100">
        {(
          [
            { key: 'corporates', label: `Corporates (${corporates?.length || 0})` },
            { key: 'leads', label: `Leads${pendingLeads.length ? ` (${pendingLeads.length})` : ''}` },
          ] as const
        ).map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            className={`flex-1 py-3 items-center border-b-2 ${tab === t.key ? 'border-orange-500' : 'border-transparent'}`}
          >
            <Text className={tab === t.key ? 'text-orange-500 font-bold' : 'text-gray-500'}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FE8733" />}
      >
        <View className="p-4">
          {tab === 'corporates' ? (
            isLoading ? (
              <ActivityIndicator size="large" color="#FE8733" className="mt-10" />
            ) : (corporates || []).length === 0 ? (
              <Card className="p-6 items-center">
                <Icon name="business" size={36} color="#D1D5DB" />
                <Text className="text-gray-500 text-sm mt-2 text-center">
                  No corporate partners yet. Approve a lead or tap New.
                </Text>
              </Card>
            ) : (
              (corporates || []).map((c) => (
                <Card key={c._id} className="p-4 mb-3">
                  <TouchableOpacity onPress={() => setDetailFor(c)} activeOpacity={0.7}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-2">
                        <View className="flex-row items-center">
                          <Text className="text-base font-bold text-gray-800">{c.name}</Text>
                          <View className={`ml-2 px-2 py-0.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-200'}`}>
                            <Text className={`text-[10px] font-bold ${c.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-600'}`}>
                              {c.status}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-gray-500 mt-1">
                          Code: <Text className="font-semibold text-gray-700">{c.code}</Text>
                          {'  ·  '}Cap {c.maxMealsPerWindow}/window
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                          {c.lockedAddress.locality}, {c.lockedAddress.city} · {c.memberCount ?? 0} members · {c.activePlanCount ?? 0} plans
                        </Text>
                      </View>
                      <View className="items-end">
                        <TouchableOpacity onPress={() => openEdit(c)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Icon name="edit" size={20} color="#FE8733" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => toggleStatus(c)}
                          className={`mt-2 w-12 h-6 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <View className={`w-5 h-5 rounded-full bg-white m-0.5 ${c.status === 'ACTIVE' ? 'self-end' : 'self-start'}`} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))
            )
          ) : leadsLoading ? (
            <ActivityIndicator size="large" color="#FE8733" className="mt-10" />
          ) : (
            <>
              {pendingLeads.length === 0 && (
                <Card className="p-6 items-center mb-3">
                  <Icon name="inbox" size={36} color="#D1D5DB" />
                  <Text className="text-gray-500 text-sm mt-2">No pending partnership requests</Text>
                </Card>
              )}
              {pendingLeads.map((lead) => (
                <Card key={lead._id} className="p-4 mb-3">
                  <Text className="text-base font-bold text-gray-800">{lead.companyName}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {lead.contactName} · {lead.contactPhone}
                    {lead.contactEmail ? ` · ${lead.contactEmail}` : ''}
                  </Text>
                  {!!lead.message && <Text className="text-xs text-gray-600 mt-2">{lead.message}</Text>}
                  <View className="flex-row mt-3">
                    <TouchableOpacity
                      onPress={() => approveLead(lead)}
                      className="bg-orange-500 rounded-lg px-4 py-2 mr-2 flex-row items-center"
                    >
                      <Icon name="check" size={16} color="#fff" />
                      <Text className="text-white font-semibold ml-1">Approve & Create</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => rejectLeadMutation.mutate(lead._id)}
                      className="border border-red-300 rounded-lg px-4 py-2 flex-row items-center"
                    >
                      <Icon name="close" size={16} color="#EF4444" />
                      <Text className="text-red-500 font-semibold ml-1">Reject</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
              {settledLeads.length > 0 && (
                <>
                  <Text className="text-xs font-semibold text-gray-400 uppercase mb-2 mt-2">Reviewed</Text>
                  {settledLeads.map((lead) => (
                    <Card key={lead._id} className="p-3 mb-2 opacity-70">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-gray-700">{lead.companyName}</Text>
                        <Text className={`text-[10px] font-bold ${lead.status === 'APPROVED' ? 'text-green-600' : 'text-red-500'}`}>
                          {lead.status}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Create / Edit Corporate modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        onRequestClose={() => setFormVisible(false)}
        // iOS: keep the modal below the status bar; Android draws below it anyway.
        statusBarTranslucent={false}
        presentationStyle="fullScreen"
      >
        {/* darkIcon → dark status-bar icons on the white top (light-content
            would be invisible on white on both platforms). */}
        <SafeAreaScreen topBackgroundColor="#ffffff" bottomBackgroundColor="#ffffff" backgroundColor="#ffffff" darkIcon>
          <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
            <TouchableOpacity onPress={() => setFormVisible(false)} className="mr-3">
              <Icon name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">
              {editing ? 'Edit Corporate' : sourceLeadId ? 'Approve Lead → New Corporate' : 'New Corporate'}
            </Text>
          </View>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
          <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
            <Field label="Company name *" value={form.name} onChange={set('name')} placeholder="AIB Innovations" />
            {!editing && (
              <Field
                label="Corporate code * (employees type this to join)"
                value={form.code}
                onChange={(v) => setForm((p) => ({ ...p, code: v.toUpperCase() }))}
                placeholder="AIB2026"
                autoCapitalize="characters"
              />
            )}
            <Field
              label="Max meals per person per lunch/dinner *"
              value={form.maxMealsPerWindow}
              onChange={set('maxMealsPerWindow')}
              keyboardType="number-pad"
              placeholder="2"
            />

            <Text className="text-sm font-bold text-gray-700 mt-2 mb-2">Locked Office Address</Text>
            <Field label="Address line 1 *" value={form.addressLine1} onChange={set('addressLine1')} />
            <Field label="Address line 2" value={form.addressLine2} onChange={set('addressLine2')} />
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Field label="Locality *" value={form.locality} onChange={set('locality')} />
              </View>
              <View className="flex-1">
                <Field label="Pincode *" value={form.pincode} onChange={set('pincode')} keyboardType="number-pad" />
              </View>
            </View>
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Field label="City *" value={form.city} onChange={set('city')} />
              </View>
              <View className="flex-1">
                <Field label="State" value={form.state} onChange={set('state')} />
              </View>
            </View>
            {/* Detect / Pick-on-map — same flow as the Add/Edit Kitchen form */}
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-gray-500">Office coordinates *</Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setMapPickerVisible(true)}
                  className="flex-row items-center border border-orange-300 rounded-lg px-2.5 py-1.5 mr-2"
                >
                  <Icon name="add-location-alt" size={15} color="#FE8733" />
                  <Text className="text-orange-500 font-semibold text-xs ml-1">Pick on Map</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={detectLocation}
                  disabled={detectingLocation}
                  className="flex-row items-center border border-orange-300 rounded-lg px-2.5 py-1.5"
                >
                  {detectingLocation ? (
                    <ActivityIndicator size="small" color="#FE8733" />
                  ) : (
                    <>
                      <Icon name="my-location" size={15} color="#FE8733" />
                      <Text className="text-orange-500 font-semibold text-xs ml-1">Detect</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Field label="Latitude *" value={form.latitude} onChange={set('latitude')} keyboardType="decimal-pad" placeholder="22.7196" />
              </View>
              <View className="flex-1">
                <Field label="Longitude *" value={form.longitude} onChange={set('longitude')} keyboardType="decimal-pad" placeholder="75.8577" />
              </View>
            </View>
            <Text className="text-[11px] text-gray-400 mb-3 -mt-1">
              Tap "Detect" while at the office, or "Pick on Map" to place it anywhere — both auto-fill the address
              fields above. You can also paste coordinates from Google Maps manually.
            </Text>

            <Text className="text-sm font-bold text-gray-700 mt-1 mb-2">Company Contact</Text>
            <Field label="Contact name" value={form.contactName} onChange={set('contactName')} />
            <Field label="Contact phone" value={form.contactPhone} onChange={set('contactPhone')} keyboardType="phone-pad" />
            <Field label="Contact email" value={form.contactEmail} onChange={set('contactEmail')} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Notes" value={form.notes} onChange={set('notes')} />

            <TouchableOpacity
              onPress={handleSaveCorporate}
              disabled={saving}
              className="bg-orange-500 rounded-xl py-4 items-center mt-2 mb-10"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {editing ? 'Save Changes' : 'Create Corporate'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          </KeyboardAvoidingView>

          {/* Map picker (same component the Kitchen form uses) */}
          <LocationPickerModal
            visible={mapPickerVisible}
            initialCoords={initialMapCoords}
            onClose={() => setMapPickerVisible(false)}
            onConfirm={handleMapPick}
          />
        </SafeAreaScreen>
      </Modal>

      {/* Corporate detail (plans) modal */}
      <Modal
        visible={!!detailFor}
        animationType="slide"
        onRequestClose={() => setDetailFor(null)}
        statusBarTranslucent={false}
        presentationStyle="fullScreen"
      >
        <SafeAreaScreen topBackgroundColor="#ffffff" bottomBackgroundColor="#ffffff" backgroundColor="#ffffff" darkIcon>
          <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
            <TouchableOpacity onPress={() => { setDetailFor(null); setShowPlanForm(false); }} className="mr-3">
              <Icon name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800 flex-1" numberOfLines={1}>
              {detailFor?.name} — Voucher Plans
            </Text>
          </View>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
          <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
            {detailLoading ? (
              <ActivityIndicator size="large" color="#FE8733" className="mt-10" />
            ) : (
              <>
                {(detail?.plans || []).length === 0 && !showPlanForm && (
                  <Card className="p-6 items-center mb-3">
                    <Icon name="confirmation-number" size={36} color="#D1D5DB" />
                    <Text className="text-gray-500 text-sm mt-2 text-center">
                      No plans yet. Employees can't purchase until you add one.
                    </Text>
                  </Card>
                )}
                {(detail?.plans || []).map((plan) => (
                  <Card key={plan._id} className="p-4 mb-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-base font-bold text-gray-800">{plan.name}</Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {plan.voucherCount} vouchers · ₹{plan.price} · {plan.voucherValidityDays} days validity
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5">
                          Delivery prepaid: ₹{plan.perMealDeliveryFee}/meal
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => togglePlanStatus(plan)}
                        className={`w-12 h-6 rounded-full ${plan.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <View className={`w-5 h-5 rounded-full bg-white m-0.5 ${plan.status === 'ACTIVE' ? 'self-end' : 'self-start'}`} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}

                {showPlanForm ? (
                  <Card className="p-4 mb-3">
                    <Text className="text-sm font-bold text-gray-700 mb-3">New Plan</Text>
                    <Field label="Plan name *" value={planForm.name} onChange={(v) => setPlanForm((p) => ({ ...p, name: v }))} placeholder="AIB 20-Meal Pack" />
                    <View className="flex-row">
                      <View className="flex-1 mr-2">
                        <Field label="Vouchers *" value={planForm.voucherCount} onChange={(v) => setPlanForm((p) => ({ ...p, voucherCount: v }))} keyboardType="number-pad" placeholder="20" />
                      </View>
                      <View className="flex-1">
                        <Field label="Pack price (₹) *" value={planForm.price} onChange={(v) => setPlanForm((p) => ({ ...p, price: v }))} keyboardType="decimal-pad" placeholder="1600" />
                      </View>
                    </View>
                    <View className="flex-row">
                      <View className="flex-1 mr-2">
                        <Field label="Validity (days)" value={planForm.voucherValidityDays} onChange={(v) => setPlanForm((p) => ({ ...p, voucherValidityDays: v }))} keyboardType="number-pad" />
                      </View>
                      <View className="flex-1">
                        <Field label="Delivery fee/meal (₹)" value={planForm.perMealDeliveryFee} onChange={(v) => setPlanForm((p) => ({ ...p, perMealDeliveryFee: v }))} keyboardType="decimal-pad" />
                      </View>
                    </View>
                    <Text className="text-[11px] text-gray-400 mb-3 -mt-1">
                      Delivery fee is prepaid into the employee's wallet at purchase (fee × vouchers) and
                      debited per meal — nothing is charged at order time.
                    </Text>
                    <View className="flex-row">
                      <TouchableOpacity
                        onPress={handleAddPlan}
                        disabled={savingPlan}
                        className="bg-orange-500 rounded-lg px-4 py-2.5 mr-2 flex-1 items-center"
                        style={{ opacity: savingPlan ? 0.7 : 1 }}
                      >
                        {savingPlan ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-semibold">Add Plan</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowPlanForm(false)}
                        className="border border-gray-300 rounded-lg px-4 py-2.5 items-center"
                      >
                        <Text className="text-gray-600 font-semibold">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowPlanForm(true)}
                    className="border border-dashed border-orange-300 rounded-xl py-3 items-center mb-10 flex-row justify-center"
                  >
                    <Icon name="add" size={20} color="#FE8733" />
                    <Text className="text-orange-500 font-semibold ml-1">Add Voucher Plan</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaScreen>
      </Modal>
    </SafeAreaScreen>
  );
};

export { CorporatesScreen };
export default CorporatesScreen;
