"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getGroupDiscoveryPack } from "@/app/actions/groups";
import GroupCard from "@/app/components/GroupCard";
import Navigation from "@/app/components/Navigation";


export default function PrePartyDiscoveryPage() {

  const [groups, setGroups] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const router = useRouter();
  const observer = useRef<IntersectionObserver | null>(null);

  const loadGroups = async (pageNumber: number) => {
    setIsLoading(true);
    const result = await getGroupDiscoveryPack(pageNumber, 10, "Pre-party");
    
    if (result?.groups) {
      setGroups(prev => {
        const newGroups = result.groups.filter(
          (newGroup: any) => !prev.some(existing => existing.id === newGroup.id)
        );
        return [...prev, ...newGroups];
      });
      
      if (result.groups.length < 10) {
        setHasMore(false);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadGroups(0);
  }, []);

  useEffect(() => {
    if (page > 0) {
      loadGroups(page);
    }
  }, [page]);

  const lastGroupElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const handleMessageClick = (groupId: string) => {
    router.push(`/messages/${groupId}`);
  };

  return (
    <div className="bg-black text-white font-sans h-screen overflow-hidden">
      
      <header className="fixed top-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
        <h1 className="text-2xl font-extrabold text-white drop-shadow-md">Pre-parties</h1>
      </header>

      <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-24">
        {groups.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="text-4xl mb-4">🍻</div>
            <h2 className="text-xl font-bold mb-2">No more groups nearby</h2>
            <p className="text-gray-500 text-sm">Check back later or expand your search distance.</p>
          </div>
        ) : (
          groups.map((group, index) => {
            const isLastElement = groups.length === index + 1;
            
            return (
              <div 
                key={group.id} 
                ref={isLastElement ? lastGroupElementRef : null}
                className="h-[100dvh] w-full snap-start snap-always p-2 pb-24 pt-4 flex items-center justify-center"
              >
                <div className="w-full max-w-md h-full">
                  <GroupCard group={group} onMessageClick={handleMessageClick} />
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="h-[20vh] w-full snap-start flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#FF5733] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );


}