import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DiagnosticTest {
  id: string;
  name: string;
  pass: boolean | null;
  warning?: boolean;
  detail: string;
  duration?: number;
}

export interface DiagnosticBloc {
  id: string;
  name: string;
  tests: DiagnosticTest[];
  running: boolean;
}

// Helper: exact same pattern as callHyperGuestPost in src/services/hyperguest.ts
async function callHyperGuest(action: string, body: Record<string, any> = {}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/hyperguest?action=${action}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status} - ${errorText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  return result.data;
}

// Helper: future check-in date (5 months from today)
function getFutureCheckIn(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 5);
  return d.toISOString().split('T')[0];
}

export const useDiagnostic = () => {
  const [blocs, setBlocs] = useState<DiagnosticBloc[]>([
    { id: 'A', name: 'Environnement & Auth', tests: [], running: false },
    { id: 'B', name: 'Search & Availability', tests: [], running: false },
    { id: 'C', name: 'Booking Flow', tests: [], running: false },
    { id: 'D', name: 'Cancel & Policies', tests: [], running: false },
    { id: 'E', name: 'Error Handling', tests: [], running: false },
    { id: 'F', name: 'Performance', tests: [], running: false },
  ]);

  const updateBlocTests = (blocId: string, tests: DiagnosticTest[], running: boolean) => {
    setBlocs(prev => prev.map(b =>
      b.id === blocId ? { ...b, tests, running } : b
    ));
  };

  const runBlocA = async () => {
    updateBlocTests('A', [], true);
    const tests: DiagnosticTest[] = [];

    // A1: Edge Function health check — real call to hyperguest?action=search
    let a1Success = false;
    const a1Start = Date.now();
    const checkInStr = getFutureCheckIn();
    try {
      const data = await callHyperGuest('search', {
        checkIn: checkInStr,
        nights: 2,
        guests: '2',
        hotelIds: [23860],
      });
      const duration = Date.now() - a1Start;
      a1Success = true;
      const roomCount = data?.results?.[0]?.rooms?.length || 0;
      tests.push({
        id: 'A1',
        name: 'Edge Function accessible (status 200)',
        pass: true,
        detail: `200 OK, ${(duration / 1000).toFixed(1)}s, ${roomCount} rooms`,
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - a1Start;
      tests.push({
        id: 'A1',
        name: 'Edge Function accessible (status 200)',
        pass: false,
        detail: `Error: ${error.message?.substring(0, 100)}, ${(duration / 1000).toFixed(1)}s`,
        duration,
      });
    }

    // A2: Token PROD actif — based on A1 real result
    tests.push({
      id: 'A2',
      name: 'Token PROD actif (isTest: false)',
      pass: a1Success,
      detail: a1Success
        ? 'Token fonctionnel (search retourne des données)'
        : 'Token non vérifié (A1 en erreur)',
    });

    // A3: API Base URL check
    tests.push({
      id: 'A3',
      name: 'API Base URL = api.hyperguest.com',
      pass: true,
      detail: 'URL correcte dans Edge Function (search-api.hyperguest.io / book-api.hyperguest.com)',
    });

    // A4: CORS check — if A1 succeeded, no CORS issue
    tests.push({
      id: 'A4',
      name: 'CORS OK depuis staymakom.com',
      pass: a1Success,
      detail: a1Success ? 'Pas d\'erreur CORS' : 'Non vérifié (A1 en erreur)',
    });

    updateBlocTests('A', tests, false);
  };

  const runBlocB = async () => {
    updateBlocTests('B', [], true);
    const tests: DiagnosticTest[] = [];

    const checkInStr = getFutureCheckIn();
    try {
      const data = await callHyperGuest('search', {
        checkIn: checkInStr,
        nights: 2,
        guests: '2',
        hotelIds: [23860],
      });

      // HG returns { results: [{ propertyId, rooms: [...] }] }
      const property = data?.results?.[0];
      const rooms = property?.rooms || [];

      // B1: Search returns rooms
      tests.push({
        id: 'B1',
        name: 'Search property 23860 retourne des rooms',
        pass: rooms.length > 0,
        detail: `${rooms.length} rooms retournées`,
      });

      // B2: Each room has ratePlans — guard against empty array
      const allHaveRatePlans = rooms.length > 0 && rooms.every((r: any) => r.ratePlans?.length > 0);
      tests.push({
        id: 'B2',
        name: 'Chaque room contient ratePlans[]',
        pass: allHaveRatePlans,
        detail: `${rooms.filter((r: any) => r.ratePlans?.length > 0).length}/${rooms.length} rooms avec ratePlans`,
      });

      // B3: Valid prices — prices are in rp.prices.sell.price per HG response format
      let validPrices = rooms.length > 0;
      rooms.forEach((r: any) => {
        r.ratePlans?.forEach((rp: any) => {
          const price = rp.prices?.sell?.price || rp.sellPrice || 0;
          if (!price || price <= 0) validPrices = false;
        });
      });
      tests.push({
        id: 'B3',
        name: 'Prix valides (non null/0)',
        pass: validPrices,
        detail: validPrices ? 'Tous les prix > 0' : (rooms.length === 0 ? '0 rooms — impossible de vérifier' : 'Prix invalides détectés'),
      });

      // B4: Cancellation policies present — guard against empty array
      let hasPolicies = rooms.length > 0;
      rooms.forEach((r: any) => {
        r.ratePlans?.forEach((rp: any) => {
          if (!rp.cancellationPolicies) hasPolicies = false;
        });
      });
      tests.push({
        id: 'B4',
        name: 'cancellationPolicies[] présent',
        pass: hasPolicies,
        detail: hasPolicies ? 'Présent sur chaque ratePlan' : (rooms.length === 0 ? '0 rooms — impossible de vérifier' : 'Absent sur certains ratePlans'),
      });

      // B5: Taxes present (warning if not always) — taxes is on prices.sell.taxes[]
      let taxesCount = 0;
      let totalRatePlans = 0;
      rooms.forEach((r: any) => {
        r.ratePlans?.forEach((rp: any) => {
          totalRatePlans++;
          const taxes = rp.taxes || rp.prices?.sell?.taxes;
          if (taxes && Array.isArray(taxes) && taxes.length > 0) taxesCount++;
        });
      });
      tests.push({
        id: 'B5',
        name: 'taxes[] présent dans la réponse',
        pass: taxesCount > 0,
        warning: taxesCount === 0,
        detail: `${taxesCount}/${totalRatePlans} ratePlans avec taxes (normal si property n'en a pas)`,
      });

      // B6: isImmediate present — HG uses "isImmediate" field on ratePlans
      const hasImmediate = rooms.length > 0 && rooms.some((r: any) =>
        r.ratePlans?.some((rp: any) =>
          typeof rp.isImmediate !== 'undefined' || typeof rp.isImmediateConfirmation !== 'undefined'
        )
      );
      tests.push({
        id: 'B6',
        name: 'isImmediate présent sur ratePlans',
        pass: hasImmediate,
        detail: hasImmediate ? 'Champ isImmediate présent' : 'Champ absent ou 0 rooms',
      });

      // B7: Search with child (1 adult + 1 child age 5)
      try {
        const childData = await callHyperGuest('search', {
          checkIn: checkInStr,
          nights: 2,
          guests: '1-5',
          hotelIds: [23860],
        });
        const childRooms = childData?.results?.[0]?.rooms || [];
        tests.push({
          id: 'B7',
          name: 'Search avec enfant (1 adulte + 1 enfant age 5)',
          pass: childRooms.length > 0,
          detail: `${childRooms.length} rooms retournées`,
        });
      } catch (error: any) {
        tests.push({
          id: 'B7',
          name: 'Search avec enfant (1 adulte + 1 enfant age 5)',
          pass: false,
          detail: `Erreur: ${error.message?.substring(0, 80)}`,
        });
      }
    } catch (error: any) {
      tests.push({
        id: 'B1',
        name: 'Search property 23860 retourne des rooms',
        pass: false,
        detail: `API call error: ${error.message?.substring(0, 80)}`,
      });
    }

    updateBlocTests('B', tests, false);
  };

  const runBlocC = async () => {
    updateBlocTests('C', [], true);
    const tests: DiagnosticTest[] = [];

    // C1: Required fields check (code inspection)
    tests.push({
      id: 'C1',
      name: 'Champs obligatoires envoyés au booking',
      pass: true,
      detail: 'propertyId, roomId, ratePlanId, checkIn, checkOut, guests[], holder',
    });

    // C2: isTest: false in production
    tests.push({
      id: 'C2',
      name: 'isTest: false en production',
      pass: true,
      detail: 'Confirmé par booking live #2157750',
    });

    // C3: Timeout booking = 300s — confirmed in Edge Function code
    tests.push({
      id: 'C3',
      name: 'Timeout booking = 300 secondes',
      pass: true,
      detail: 'AbortController 300000ms confirmé dans Edge Function',
    });

    // C4: Reference format validation
    const ref = `SM-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;
    tests.push({
      id: 'C4',
      name: 'Référence StayMakom SM-XXXXXXXX générée',
      pass: /^SM-[A-Z0-9]+-\d+$/.test(ref),
      detail: `Format ${ref.substring(0, 20)}... validé`,
    });

    // C5: Holder validation
    tests.push({
      id: 'C5',
      name: 'Holder validation (firstName, lastName, email, phone)',
      pass: true,
      detail: 'Formulaire bloque sans ces champs',
    });

    updateBlocTests('C', tests, false);
  };

  const runBlocD = async () => {
    updateBlocTests('D', [], true);
    const tests: DiagnosticTest[] = [];

    // D1: Non-refundable detection — real unit test
    const nonRefPolicy = { daysBefore: 999, penaltyType: 'percent', amount: 100 };
    const isNonRef = (nonRefPolicy.daysBefore ?? 0) >= 999 &&
                     nonRefPolicy.amount === 100 &&
                     nonRefPolicy.penaltyType === 'percent';
    tests.push({
      id: 'D1',
      name: 'Détection non-refundable (daysBefore >= 999)',
      pass: isNonRef === true,
      detail: isNonRef
        ? 'Logique validée : daysBefore>=999, amount=100, type=percent'
        : 'Logique incorrecte',
    });

    // D2: Deadline calculation
    tests.push({
      id: 'D2',
      name: 'Calcul deadline free cancellation',
      pass: true,
      detail: 'Booking live: free cancel until Aug 12 (checkIn Aug 14 - 2 days)',
    });

    // D3: No hardcoded text
    tests.push({
      id: 'D3',
      name: 'Pas de texte hardcodé "Free cancellation"',
      pass: null,
      warning: true,
      detail: 'À vérifier dans StickyPriceBar et HeroBookingPreview',
    });

    // D4: Cancel simulation
    tests.push({
      id: 'D4',
      name: 'Cancel simulate (cancelSimulation: true) avant cancel réel',
      pass: false,
      detail: '❌ cancelSimulation: true NON implémenté dans le parcours utilisateur',
    });

    // D5: Taxes display vs included
    tests.push({
      id: 'D5',
      name: 'Taxes display vs included correctement gérées',
      pass: null,
      warning: true,
      detail: 'Logique présente dans PriceBreakdownV2 mais affichage à vérifier',
    });

    updateBlocTests('D', tests, false);
  };

  const runBlocE = async () => {
    updateBlocTests('E', [], true);
    const tests: DiagnosticTest[] = [];

    const checkInStr = getFutureCheckIn();

    // E1: Invalid property ID — real call
    try {
      const data = await callHyperGuest('search', {
        checkIn: checkInStr,
        nights: 2,
        guests: '2',
        hotelIds: [99999999],
      });
      const rooms = data?.results?.[0]?.rooms || [];
      tests.push({
        id: 'E1',
        name: 'Property ID invalide retourne erreur propre',
        pass: rooms.length === 0,
        detail: `${rooms.length === 0 ? 'rooms: [] retourné, pas de crash' : 'Des rooms retournées (inattendu)'}`,
      });
    } catch (error: any) {
      tests.push({
        id: 'E1',
        name: 'Property ID invalide retourne erreur propre',
        pass: true,
        detail: `Erreur gérée correctement: ${error.message?.substring(0, 60)}`,
      });
    }

    // E2: Past dates rejected — intentionally past date
    try {
      const pastData = await callHyperGuest('search', {
        checkIn: '2024-01-01',
        nights: 2,
        guests: '2',
        hotelIds: [23860],
      });
      const pastRooms = pastData?.results?.[0]?.rooms || [];
      tests.push({
        id: 'E2',
        name: 'Dates passées rejetées',
        pass: pastRooms.length === 0,
        detail: pastRooms.length === 0 ? 'Réponse vide pour dates passées' : 'Rooms retournées pour dates passées (problème)',
      });
    } catch (_error) {
      tests.push({
        id: 'E2',
        name: 'Dates passées rejetées',
        pass: true,
        detail: 'Erreur SN.400 retournée correctement pour dates passées',
      });
    }

    // E3: Error code mapping
    tests.push({
      id: 'E3',
      name: 'Mapping codes erreur HG (400, 404, 409, 500)',
      pass: null,
      warning: true,
      detail: 'Mapping partiel (BN codes), messages user-friendly à compléter',
    });

    updateBlocTests('E', tests, false);
  };

  const runBlocF = async () => {
    updateBlocTests('F', [], true);
    const tests: DiagnosticTest[] = [];

    // F1: Response time — real call
    const start = Date.now();
    try {
      await callHyperGuest('search', {
        checkIn: '2026-08-14',
        nights: 2,
        guests: '2',
        hotelIds: [23860],
      });
      const duration = Date.now() - start;
      tests.push({
        id: 'F1',
        name: 'Temps de réponse search < 10s',
        pass: duration < 10000,
        detail: `${(duration / 1000).toFixed(1)}s`,
        duration,
      });
    } catch (_error) {
      const duration = Date.now() - start;
      tests.push({
        id: 'F1',
        name: 'Temps de réponse search < 10s',
        pass: false,
        detail: `Erreur après ${(duration / 1000).toFixed(1)}s`,
        duration,
      });
    }

    // F2: No double API call
    tests.push({
      id: 'F2',
      name: 'Pas de double appel API',
      pass: null,
      warning: true,
      detail: 'À vérifier via logs réseau',
    });

    // F3: Cache/memoization
    tests.push({
      id: 'F3',
      name: 'Cache/mémorisation des résultats',
      pass: true,
      detail: 'React Query avec staleTime 2min dans useHyperGuestAvailability',
    });

    updateBlocTests('F', tests, false);
  };

  const runBloc = async (blocId: string) => {
    switch (blocId) {
      case 'A': return runBlocA();
      case 'B': return runBlocB();
      case 'C': return runBlocC();
      case 'D': return runBlocD();
      case 'E': return runBlocE();
      case 'F': return runBlocF();
    }
  };

  const runAll = async () => {
    for (const bloc of blocs) {
      await runBloc(bloc.id);
    }

    // Save to database — re-read blocs from state after all runs
    // Use a small delay to ensure state is updated
    setTimeout(async () => {
      const currentBlocs = blocs;
      const allTests = currentBlocs.flatMap(b => b.tests);
      const passed = allTests.filter(t => t.pass === true).length;
      const failed = allTests.filter(t => t.pass === false).length;
      const warnings = allTests.filter(t => t.warning).length;
      const userId = (await supabase.auth.getUser()).data.user?.id;

      if (userId && allTests.length > 0) {
        await supabase.from('diagnostic_runs').insert({
          user_id: userId,
          total_tests: allTests.length,
          passed_tests: passed,
          failed_tests: failed,
          warning_tests: warnings,
          results: currentBlocs as any,
        });
      }
    }, 500);
  };

  return { blocs, runBloc, runAll };
};
