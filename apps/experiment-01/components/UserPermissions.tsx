"use client";
import { useEffect, useState } from "react";
import { supabase } from "../app/supabaseClient";
import { get } from "http";

export function useUserPermissions() {
  const [userId, setUserId] = useState("");
  const [perm, setPerm] = useState("");
  const [id, setId] = useState("");
  const [perms, setPermissions] = useState("");
  const [read, setRead] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const authToken = localStorage.getItem(
      "sb-velfmvmemrzurdweumyo-auth-token"
    );
    if (authToken) {
      try {
        const parsedToken = JSON.parse(authToken);
        setUserId(parsedToken?.user?.id);
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      getInfo(userId);
      getId(userId);
      getName(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (perm) {
      getPerm(perm);
    }
  }, [perm]);

  async function getInfo(userId: any) {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from("Agents")
        .select("perm")
        .eq("user_id", userId)
        .single();

      if (agentError) {
        throw new Error(agentError.message);
      }

      if (agentData) {
        setPerm(agentData.perm);
      }

      return agentData;
    } catch (error) {
      console.error("Error fetching agent info:", error);
      throw error;
    }
  }

  async function getId(userId: any) {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from("Agents")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (agentError) {
        throw new Error(agentError.message);
      }

      if (agentData) {
        setId(agentData.id);
      }

      return agentData;
    } catch (error) {
      console.error("Error fetching agent info:", error);
      throw error;
    }
  }

  async function getName(userId: any) {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from("Agents")
        .select("username")
        .eq("user_id", userId)
        .single();

      if (agentData) {
        // Set name to a specific property, e.g., username
        setName(agentData.username);
      }

      return agentData;
    } catch (error) {
      console.error("Error fetching name:", error);
      throw error;
    }
  }

  async function getPerm(perm: any) {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from("Permissions")
        .select("*")
        .eq("id", perm)
        .single();

      if (agentData) {
        setPermissions(agentData);
      }

      return agentData;
    } catch (error) {
      console.error("Error fetching permission info:", error);
      throw error;
    }
  }

  return { userId, perms, id, name };
}
