"use client";

import { motion, useReducedMotion } from "motion/react";

const kw = "text-brand";
const str = "text-success";
const muted = "text-muted-foreground";

export const HeroCodePanel = () => {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full min-w-0 max-w-md overflow-hidden rounded-2xl border border-border bg-foreground/[0.03] shadow-sm dark:bg-white/5"
        >
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span className="size-2 rounded-full bg-muted-foreground/30" />
                <span className="font-mono text-xs text-muted-foreground">auth-store.ts</span>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed">
                <code>
                    <span className={kw}>import</span> {"{ useAuthStore }"} <span className={kw}>from</span>{" "}
                    <span className={str}>&quot;@/store/auth-store&quot;</span>
                    {"\n\n"}
                    <span className={kw}>const</span> user = useAuthStore((s) {"=>"} s.user);
                    {"\n"}
                    <span className={kw}>const</span> signOut = useAuthStore(
                    {"\n"}
                    {"  "}(s) {"=>"} s.logoutWithReload
                    {"\n"}
                    );
                    {"\n\n"}
                    <span className={muted}>{"// session, roles, and refresh tokens\n// already wired up for you"}</span>
                </code>
            </pre>
        </motion.div>
    );
};
