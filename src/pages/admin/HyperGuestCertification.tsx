import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Play, PlayCircle, Download, CheckCircle, XCircle, Clock, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface TestResult {
  name: string;
  logs: any[];
  success: boolean;
  error?: string;
}

const TEST_DESCRIPTIONS = [
  "Pre-book: 1 room, 1 adult",
  "Book: 1 room, 1 adult",
  "Book: 1 room, 2 adults + 1 child + 1 infant",
  "Book: 2 rooms (2 adults + 1 adult)",
  "Book: 2 rooms (1a+1c / 2a+1i)",
  "Book: 2 rooms different types/rates",
  "Book: Same-day booking",
  "Book: Currency conversion (EUR)",
  "Book: Nationality (FR)",
  "Cancel: Refundable reservation",
  "Cancel: Non-refundable attempt",
  "Book: Package rate",
];

export default function HyperGuestCertification() {
  const [results, setResults] = useState<Record<number, TestResult | 'loading'>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);

  const runTest = async (testNumber: number) => {
    setResults(prev => ({ ...prev, [testNumber]: 'loading' }));
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/hyperguest-certification?test=${testNumber}`,
        { headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.results?.[0]) {
        setResults(prev => ({ ...prev, [testNumber]: result.results[0] }));
        if (result.results[0].success) {
          toast.success(`Test ${testNumber} passed`);
        } else {
          toast.error(`Test ${testNumber} failed: ${result.results[0].error || 'Unknown error'}`);
        }
      } else if (result.error) {
        setResults(prev => ({ ...prev, [testNumber]: { name: `Test ${testNumber}`, logs: [], success: false, error: result.error } }));
        toast.error(`Test ${testNumber}: ${result.error}`);
      }
    } catch (e: any) {
      setResults(prev => ({ ...prev, [testNumber]: { name: `Test ${testNumber}`, logs: [], success: false, error: e.message } }));
      toast.error(`Test ${testNumber} error: ${e.message}`);
    }
  };

  const runAll = async () => {
    setIsRunningAll(true);
    for (let i = 1; i <= 12; i++) {
      await runTest(i);
    }
    setIsRunningAll(false);
    toast.success("All 12 tests completed!");
  };

  const exportLogs = () => {
    const exportData = {
      certification_date: new Date().toISOString(),
      property_id: 19912,
      platform: "StayMakom",
      results: Object.entries(results)
        .filter(([, v]) => v !== 'loading')
        .map(([k, v]) => ({ test_number: parseInt(k), ...(v as TestResult) })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hyperguest-certification-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const passedCount = Object.values(results).filter(r => r !== 'loading' && (r as TestResult).success).length;
  const failedCount = Object.values(results).filter(r => r !== 'loading' && !(r as TestResult).success).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">HyperGuest Certification</h1>
          <p className="text-muted-foreground text-sm">Property ID: 19912 — 12 test scenarios</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAll} disabled={isRunningAll} size="sm">
            {isRunningAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
            Run All Tests
          </Button>
          <Button onClick={exportLogs} variant="outline" size="sm" disabled={Object.keys(results).length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      {(passedCount + failedCount > 0) && (
        <div className="flex gap-3 items-center">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✅ {passedCount} passed
          </Badge>
          {failedCount > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              ❌ {failedCount} failed
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {passedCount + failedCount} / 12 completed
          </span>
        </div>
      )}

      {/* Test cards */}
      <div className="grid gap-3">
        {TEST_DESCRIPTIONS.map((desc, i) => {
          const testNum = i + 1;
          const result = results[testNum];
          const isLoading = result === 'loading';
          const testResult = result && result !== 'loading' ? result as TestResult : null;

          return (
            <Card key={testNum} className={
              testResult?.success ? 'border-green-200 bg-green-50/30' :
              testResult && !testResult.success ? 'border-red-200 bg-red-50/30' : ''
            }>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono text-xs w-8 justify-center">
                      {testNum}
                    </Badge>
                    <div>
                      <CardTitle className="text-sm font-medium">Test #{testNum}</CardTitle>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {testResult?.success && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {testResult && !testResult.success && <XCircle className="h-4 w-4 text-red-600" />}
                    {!result && <Clock className="h-4 w-4 text-muted-foreground" />}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => runTest(testNum)}
                      disabled={isLoading || isRunningAll}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {testResult && (
                <CardContent className="pt-0 px-4 pb-3">
                  {testResult.error && (
                    <p className="text-xs text-red-600 mb-2 font-mono bg-red-50 p-2 rounded">
                      Error: {testResult.error}
                    </p>
                  )}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className="h-3 w-3" />
                      View logs ({testResult.logs.length} steps)
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <pre className="mt-2 text-[10px] bg-muted p-3 rounded overflow-x-auto max-h-[400px] overflow-y-auto">
                        {JSON.stringify(testResult.logs, null, 2)}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
