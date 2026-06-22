import { create } from 'zustand';
import { initialStudyPlans } from '../data/studyPlans';

const PLANS_KEY = 'swaya_study_plans';
const LIVE_PLAN_KEY = 'swaya_live_study_plan_id';

const readPlans = () => {
  try {
    return JSON.parse(localStorage.getItem(PLANS_KEY)) || initialStudyPlans;
  } catch {
    return initialStudyPlans;
  }
};

const writePlans = plans => localStorage.setItem(PLANS_KEY, JSON.stringify(plans));

const makeId = () => `plan_${Date.now()}_${Math.random().toString(16).slice(2, 7)}`;

export const useStudyPlanStore = create((set, get) => ({
  plans: readPlans(),
  selectedLivePlanId: localStorage.getItem(LIVE_PLAN_KEY) || initialStudyPlans[0]?.id || null,
  addPlan: plan => {
    const nextPlan = {
      ...plan,
      id: plan.id || makeId(),
      createdAt: plan.createdAt || new Date().toISOString(),
      status: plan.status || 'saved',
      linkedSessionId: plan.linkedSessionId ?? null,
    };
    const plans = [nextPlan, ...get().plans];
    writePlans(plans);
    set({ plans });
    return nextPlan;
  },
  updatePlan: (id, updates) => {
    const plans = get().plans.map(plan => (plan.id === id ? { ...plan, ...updates } : plan));
    writePlans(plans);
    set({ plans });
  },
  deletePlan: id => {
    const plans = get().plans.filter(plan => plan.id !== id);
    writePlans(plans);
    const selectedLivePlanId = get().selectedLivePlanId === id ? null : get().selectedLivePlanId;
    if (selectedLivePlanId) localStorage.setItem(LIVE_PLAN_KEY, selectedLivePlanId);
    else localStorage.removeItem(LIVE_PLAN_KEY);
    set({ plans, selectedLivePlanId });
  },
  useInLiveSession: id => {
    const plans = get().plans.map(plan => (
      plan.id === id ? { ...plan, status: 'used_in_session', linkedSessionId: plan.linkedSessionId || 'live_demo' } : plan
    ));
    writePlans(plans);
    localStorage.setItem(LIVE_PLAN_KEY, id);
    set({ plans, selectedLivePlanId: id });
  },
  setSelectedLivePlan: id => {
    if (id) localStorage.setItem(LIVE_PLAN_KEY, id);
    else localStorage.removeItem(LIVE_PLAN_KEY);
    set({ selectedLivePlanId: id || null });
  },
  getSelectedLivePlan: () => get().plans.find(plan => plan.id === get().selectedLivePlanId) || null,
}));
